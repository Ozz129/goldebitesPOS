import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import {
  InventoryTransferItemRow,
  InventoryTransferRow,
  TransferStatus,
} from '../domain/inventory-transfer.interface';
import {
  CreateTransferData,
  TransferItemInput,
  TransferQuery,
} from '../domain/inventory-transfer.types';
import { IInventoryTransfersRepository } from './inventory-transfers.repository.interface';

const SELECT_COLUMNS = `id, business_id, from_branch_id, to_branch_id, from_location_id, to_location_id,
  status, requested_by, completed_by, created_at, completed_at, notes`;

interface CountRow {
  count: string;
}

@Injectable()
export class InventoryTransfersRepository implements IInventoryTransfersRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateTransferData,
    requestedBy: string | undefined,
    client?: DbClient,
  ): Promise<InventoryTransferRow> {
    const result = await this.db.query<InventoryTransferRow>(
      `INSERT INTO inventory_transfers
         (business_id, from_branch_id, to_branch_id, from_location_id, to_location_id, requested_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.fromBranchId,
        data.toBranchId,
        data.fromLocationId ?? null,
        data.toLocationId ?? null,
        requestedBy ?? null,
        data.notes ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<InventoryTransferRow | null> {
    const result = await this.db.query<InventoryTransferRow>(
      `SELECT ${SELECT_COLUMNS} FROM inventory_transfers WHERE id = $1 AND business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: TransferQuery,
  ): Promise<{ rows: InventoryTransferRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.status) {
      params.push(query.status);
      conditions.push(`status = $${params.length}`);
    }

    if (query.branchId) {
      params.push(query.branchId);
      conditions.push(
        `(from_branch_id = $${params.length} OR to_branch_id = $${params.length})`,
      );
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM inventory_transfers WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<InventoryTransferRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM inventory_transfers
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async addItems(
    transferId: string,
    items: TransferItemInput[],
    client?: DbClient,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    await this.db.query(
      `INSERT INTO inventory_transfer_items (transfer_id, inventory_item_id, quantity)
       SELECT $1, unnest($2::uuid[]), unnest($3::numeric[])`,
      [
        transferId,
        items.map((item) => item.inventoryItemId),
        items.map((item) => item.quantity),
      ],
      client,
    );
  }

  async findItems(
    transferId: string,
    client?: DbClient,
  ): Promise<InventoryTransferItemRow[]> {
    const result = await this.db.query<InventoryTransferItemRow>(
      `SELECT iti.id, iti.transfer_id, iti.inventory_item_id, ii.name AS inventory_item_name, iti.quantity
       FROM inventory_transfer_items iti
       JOIN inventory_items ii ON ii.id = iti.inventory_item_id
       WHERE iti.transfer_id = $1
       ORDER BY ii.name`,
      [transferId],
      client,
    );
    return result.rows;
  }

  async setStatus(
    id: string,
    businessId: string,
    status: TransferStatus,
    completedBy: string | undefined,
    client?: DbClient,
  ): Promise<InventoryTransferRow | null> {
    const result = await this.db.query<InventoryTransferRow>(
      `UPDATE inventory_transfers
       SET status = $3,
           completed_by = COALESCE($4, completed_by),
           completed_at = CASE WHEN $3::varchar IN ('COMPLETED', 'CANCELLED') THEN now() ELSE completed_at END
       WHERE id = $1 AND business_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, status, completedBy ?? null],
      client,
    );
    return result.rows[0] ?? null;
  }
}
