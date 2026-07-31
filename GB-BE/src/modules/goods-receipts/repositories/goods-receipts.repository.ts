import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import {
  GoodsReceiptItemRow,
  GoodsReceiptRow,
} from '../domain/goods-receipt.interface';
import {
  CreateGoodsReceiptData,
  GoodsReceiptItemInput,
  GoodsReceiptQuery,
} from '../domain/goods-receipt.types';
import { IGoodsReceiptsRepository } from './goods-receipts.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, purchase_order_id, received_by, received_at, notes`;

interface CountRow {
  count: string;
}

@Injectable()
export class GoodsReceiptsRepository implements IGoodsReceiptsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateGoodsReceiptData,
    receivedBy: string | undefined,
    client?: DbClient,
  ): Promise<GoodsReceiptRow> {
    const result = await this.db.query<GoodsReceiptRow>(
      `INSERT INTO goods_receipts (business_id, branch_id, purchase_order_id, received_by, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.branchId,
        data.purchaseOrderId,
        receivedBy ?? null,
        data.notes ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async addItems(
    goodsReceiptId: string,
    items: (GoodsReceiptItemInput & { inventoryItemId: string })[],
    client?: DbClient,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    await this.db.query(
      `INSERT INTO goods_receipt_items (goods_receipt_id, purchase_order_item_id, inventory_item_id, quantity_received, unit_cost)
       SELECT $1, unnest($2::uuid[]), unnest($3::uuid[]), unnest($4::numeric[]), unnest($5::numeric[])`,
      [
        goodsReceiptId,
        items.map((item) => item.purchaseOrderItemId),
        items.map((item) => item.inventoryItemId),
        items.map((item) => item.quantityReceived),
        items.map((item) => item.unitCost),
      ],
      client,
    );
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<GoodsReceiptRow | null> {
    const result = await this.db.query<GoodsReceiptRow>(
      `SELECT ${SELECT_COLUMNS} FROM goods_receipts WHERE id = $1 AND business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: GoodsReceiptQuery,
  ): Promise<{ rows: GoodsReceiptRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.purchaseOrderId) {
      params.push(query.purchaseOrderId);
      conditions.push(`purchase_order_id = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM goods_receipts WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<GoodsReceiptRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM goods_receipts
       WHERE ${whereClause}
       ORDER BY received_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async findItems(
    goodsReceiptId: string,
    client?: DbClient,
  ): Promise<GoodsReceiptItemRow[]> {
    const result = await this.db.query<GoodsReceiptItemRow>(
      `SELECT gri.id, gri.goods_receipt_id, gri.purchase_order_item_id, gri.inventory_item_id,
              ii.name AS inventory_item_name, gri.quantity_received, gri.unit_cost
       FROM goods_receipt_items gri
       JOIN inventory_items ii ON ii.id = gri.inventory_item_id
       WHERE gri.goods_receipt_id = $1
       ORDER BY ii.name`,
      [goodsReceiptId],
      client,
    );
    return result.rows;
  }
}
