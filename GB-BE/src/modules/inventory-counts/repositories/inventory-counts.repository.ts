import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import {
  CountStatus,
  InventoryCountItemRow,
  InventoryCountRow,
} from '../domain/inventory-count.interface';
import { CountQuery, StartCountData } from '../domain/inventory-count.types';
import { IInventoryCountsRepository } from './inventory-counts.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, location_id, status, started_by, started_at,
  completed_by, completed_at, notes`;

interface CountRow {
  count: string;
}

@Injectable()
export class InventoryCountsRepository implements IInventoryCountsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: StartCountData,
    client?: DbClient,
  ): Promise<InventoryCountRow> {
    const result = await this.db.query<InventoryCountRow>(
      `INSERT INTO inventory_counts (business_id, branch_id, location_id)
       VALUES ($1, $2, $3)
       RETURNING ${SELECT_COLUMNS}`,
      [data.businessId, data.branchId, data.locationId ?? null],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<InventoryCountRow | null> {
    const result = await this.db.query<InventoryCountRow>(
      `SELECT ${SELECT_COLUMNS} FROM inventory_counts WHERE id = $1 AND business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: CountQuery,
  ): Promise<{ rows: InventoryCountRow[]; total: number }> {
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

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM inventory_counts WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<InventoryCountRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM inventory_counts
       WHERE ${whereClause}
       ORDER BY started_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async addItems(
    countId: string,
    items: { inventoryItemId: string; expectedQuantity: number }[],
    client?: DbClient,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    await this.db.query(
      `INSERT INTO inventory_count_items (count_id, inventory_item_id, expected_quantity)
       SELECT $1, unnest($2::uuid[]), unnest($3::numeric[])`,
      [
        countId,
        items.map((item) => item.inventoryItemId),
        items.map((item) => item.expectedQuantity),
      ],
      client,
    );
  }

  async findItems(
    countId: string,
    client?: DbClient,
  ): Promise<InventoryCountItemRow[]> {
    const result = await this.db.query<InventoryCountItemRow>(
      `SELECT ici.id, ici.count_id, ici.inventory_item_id, ii.name AS inventory_item_name, ii.unit,
              ici.expected_quantity, ici.counted_quantity, ici.counted_at
       FROM inventory_count_items ici
       JOIN inventory_items ii ON ii.id = ici.inventory_item_id
       WHERE ici.count_id = $1
       ORDER BY ii.name`,
      [countId],
      client,
    );
    return result.rows;
  }

  async findItem(
    countId: string,
    inventoryItemId: string,
    client?: DbClient,
  ): Promise<InventoryCountItemRow | null> {
    const result = await this.db.query<InventoryCountItemRow>(
      `SELECT ici.id, ici.count_id, ici.inventory_item_id, ii.name AS inventory_item_name, ii.unit,
              ici.expected_quantity, ici.counted_quantity, ici.counted_at
       FROM inventory_count_items ici
       JOIN inventory_items ii ON ii.id = ici.inventory_item_id
       WHERE ici.count_id = $1 AND ici.inventory_item_id = $2`,
      [countId, inventoryItemId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async recordCountedQuantity(
    countId: string,
    inventoryItemId: string,
    countedQuantity: number,
    client?: DbClient,
  ): Promise<void> {
    await this.db.query(
      `UPDATE inventory_count_items
       SET counted_quantity = $3, counted_at = now()
       WHERE count_id = $1 AND inventory_item_id = $2`,
      [countId, inventoryItemId, countedQuantity],
      client,
    );
  }

  async setStatus(
    id: string,
    businessId: string,
    status: CountStatus,
    completedBy: string | undefined,
    client?: DbClient,
  ): Promise<InventoryCountRow | null> {
    const result = await this.db.query<InventoryCountRow>(
      `UPDATE inventory_counts
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
