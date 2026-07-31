import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import {
  PurchaseOrderItemRow,
  PurchaseOrderRow,
  PurchaseOrderStatus,
} from '../domain/purchase-order.interface';
import {
  CreatePurchaseOrderData,
  PurchaseOrderItemInput,
  PurchaseOrderQuery,
} from '../domain/purchase-order.types';
import { IPurchaseOrdersRepository } from './purchase-orders.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, supplier_id, order_number, status, order_date,
  expected_date, subtotal, tax_amount, total_amount, notes, created_by, created_at, updated_at`;

const ITEM_SELECT = `poi.id, poi.purchase_order_id, poi.inventory_item_id, ii.name AS inventory_item_name,
  ii.unit, poi.quantity, poi.unit_cost, poi.total_cost,
  COALESCE(gri.received_quantity, 0)::text AS received_quantity`;

const ITEM_JOIN = `
  FROM purchase_order_items poi
  JOIN inventory_items ii ON ii.id = poi.inventory_item_id
  LEFT JOIN (
    SELECT purchase_order_item_id, SUM(quantity_received) AS received_quantity
    FROM goods_receipt_items
    GROUP BY purchase_order_item_id
  ) gri ON gri.purchase_order_item_id = poi.id
`;

interface CountRow {
  count: string;
}

interface NextValRow {
  n: string;
}

@Injectable()
export class PurchaseOrdersRepository implements IPurchaseOrdersRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreatePurchaseOrderData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<PurchaseOrderRow> {
    const seq = await this.db.query<NextValRow>(
      `SELECT nextval('purchase_order_number_sequence')::text AS n`,
      [],
      client,
    );
    const orderNumber = `PO-${seq.rows[0].n.padStart(6, '0')}`;

    const result = await this.db.query<PurchaseOrderRow>(
      `INSERT INTO purchase_orders (business_id, branch_id, supplier_id, order_number, expected_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.branchId,
        data.supplierId,
        orderNumber,
        data.expectedDate ?? null,
        data.notes ?? null,
        createdBy ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<PurchaseOrderRow | null> {
    const result = await this.db.query<PurchaseOrderRow>(
      `SELECT ${SELECT_COLUMNS} FROM purchase_orders WHERE id = $1 AND business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: PurchaseOrderQuery,
  ): Promise<{ rows: PurchaseOrderRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.status) {
      params.push(query.status);
      conditions.push(`status = $${params.length}`);
    }
    if (query.branchId) {
      params.push(query.branchId);
      conditions.push(`branch_id = $${params.length}`);
    }
    if (query.supplierId) {
      params.push(query.supplierId);
      conditions.push(`supplier_id = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM purchase_orders WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<PurchaseOrderRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM purchase_orders
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async addItems(
    purchaseOrderId: string,
    items: PurchaseOrderItemInput[],
    client?: DbClient,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    await this.db.query(
      `INSERT INTO purchase_order_items (purchase_order_id, inventory_item_id, quantity, unit_cost, total_cost)
       SELECT $1, unnest($2::uuid[]), unnest($3::numeric[]), unnest($4::numeric[]),
              unnest($3::numeric[]) * unnest($4::numeric[])`,
      [
        purchaseOrderId,
        items.map((item) => item.inventoryItemId),
        items.map((item) => item.quantity),
        items.map((item) => item.unitCost),
      ],
      client,
    );
  }

  async findItems(
    purchaseOrderId: string,
    client?: DbClient,
  ): Promise<PurchaseOrderItemRow[]> {
    const result = await this.db.query<PurchaseOrderItemRow>(
      `SELECT ${ITEM_SELECT} ${ITEM_JOIN} WHERE poi.purchase_order_id = $1 ORDER BY ii.name`,
      [purchaseOrderId],
      client,
    );
    return result.rows;
  }

  async findItemById(
    itemId: string,
    client?: DbClient,
  ): Promise<PurchaseOrderItemRow | null> {
    const result = await this.db.query<PurchaseOrderItemRow>(
      `SELECT ${ITEM_SELECT} ${ITEM_JOIN} WHERE poi.id = $1`,
      [itemId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async updateTotals(
    id: string,
    subtotal: number,
    taxAmount: number,
    totalAmount: number,
    client?: DbClient,
  ): Promise<void> {
    await this.db.query(
      `UPDATE purchase_orders SET subtotal = $2, tax_amount = $3, total_amount = $4 WHERE id = $1`,
      [id, subtotal, taxAmount, totalAmount],
      client,
    );
  }

  async setStatus(
    id: string,
    businessId: string,
    status: PurchaseOrderStatus,
    client?: DbClient,
  ): Promise<PurchaseOrderRow | null> {
    const result = await this.db.query<PurchaseOrderRow>(
      `UPDATE purchase_orders SET status = $3
       WHERE id = $1 AND business_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, status],
      client,
    );
    return result.rows[0] ?? null;
  }

  async hasReceipts(
    purchaseOrderId: string,
    client?: DbClient,
  ): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM goods_receipts WHERE purchase_order_id = $1 LIMIT 1`,
      [purchaseOrderId],
      client,
    );
    return result.rows.length > 0;
  }
}
