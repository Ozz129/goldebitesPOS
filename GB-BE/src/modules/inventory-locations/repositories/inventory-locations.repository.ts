import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { InventoryLocationRow } from '../domain/inventory-location.interface';
import {
  CreateInventoryLocationData,
  InventoryLocationQuery,
  UpdateInventoryLocationData,
} from '../domain/inventory-location.types';
import { IInventoryLocationsRepository } from './inventory-locations.repository.interface';

const SELECT_COLUMNS = `id, branch_id, name, description, is_active, created_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class InventoryLocationsRepository implements IInventoryLocationsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateInventoryLocationData,
    client?: DbClient,
  ): Promise<InventoryLocationRow> {
    const result = await this.db.query<InventoryLocationRow>(
      `INSERT INTO inventory_locations (branch_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING ${SELECT_COLUMNS}`,
      [data.branchId, data.name, data.description ?? null],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    branchId: string,
    client?: DbClient,
  ): Promise<InventoryLocationRow | null> {
    const result = await this.db.query<InventoryLocationRow>(
      `SELECT ${SELECT_COLUMNS} FROM inventory_locations WHERE id = $1 AND branch_id = $2`,
      [id, branchId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: InventoryLocationQuery,
  ): Promise<{ rows: InventoryLocationRow[]; total: number }> {
    const conditions: string[] = ['branch_id = $1'];
    const params: unknown[] = [query.branchId];

    if (query.isActive !== undefined) {
      params.push(query.isActive);
      conditions.push(`is_active = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM inventory_locations WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<InventoryLocationRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM inventory_locations
       WHERE ${whereClause}
       ORDER BY name
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    branchId: string,
    data: UpdateInventoryLocationData,
    client?: DbClient,
  ): Promise<InventoryLocationRow | null> {
    const result = await this.db.query<InventoryLocationRow>(
      `UPDATE inventory_locations
       SET name = COALESCE($3, name),
           description = COALESCE($4, description)
       WHERE id = $1 AND branch_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [id, branchId, data.name ?? null, data.description ?? null],
      client,
    );
    return result.rows[0] ?? null;
  }

  async setActive(
    id: string,
    branchId: string,
    isActive: boolean,
  ): Promise<InventoryLocationRow | null> {
    const result = await this.db.query<InventoryLocationRow>(
      `UPDATE inventory_locations SET is_active = $3
       WHERE id = $1 AND branch_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [id, branchId, isActive],
    );
    return result.rows[0] ?? null;
  }

  async existsByName(
    branchId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM inventory_locations
       WHERE branch_id = $1 AND name = $2 AND ($3::uuid IS NULL OR id != $3)`,
      [branchId, name, excludeId ?? null],
    );
    return result.rows.length > 0;
  }
}
