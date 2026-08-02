import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { InventoryItemRow } from '../domain/inventory-item.interface';
import {
  CreateInventoryItemData,
  InventoryItemQuery,
  UpdateInventoryItemData,
} from '../domain/inventory-item.types';
import { IInventoryItemsRepository } from './inventory-items.repository.interface';

const SELECT_COLUMNS = `id, business_id, category_id, name, sku, unit, minimum_stock, current_cost, serial_number, brand, model, is_active, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class InventoryItemsRepository implements IInventoryItemsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateInventoryItemData,
    client?: DbClient,
  ): Promise<InventoryItemRow> {
    const result = await this.db.query<InventoryItemRow>(
      `INSERT INTO inventory_items (business_id, category_id, name, sku, unit, minimum_stock, current_cost, serial_number, brand, model)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::numeric, 0), COALESCE($7::numeric, 0), $8, $9, $10)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.categoryId ?? null,
        data.name,
        data.sku ?? null,
        data.unit,
        data.minimumStock ?? null,
        data.currentCost ?? null,
        data.serialNumber ?? null,
        data.brand ?? null,
        data.model ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<InventoryItemRow | null> {
    const result = await this.db.query<InventoryItemRow>(
      `SELECT ${SELECT_COLUMNS} FROM inventory_items
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: InventoryItemQuery,
  ): Promise<{ rows: InventoryItemRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.categoryId) {
      params.push(query.categoryId);
      conditions.push(`category_id = $${params.length}`);
    }

    if (query.isActive !== undefined) {
      params.push(query.isActive);
      conditions.push(`is_active = $${params.length}`);
    }

    if (query.search) {
      params.push(`%${query.search}%`);
      const idx = params.length;
      conditions.push(`(name ILIKE $${idx} OR sku ILIKE $${idx})`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM inventory_items WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<InventoryItemRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM inventory_items
       WHERE ${whereClause}
       ORDER BY name
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateInventoryItemData,
    client?: DbClient,
  ): Promise<InventoryItemRow | null> {
    const result = await this.db.query<InventoryItemRow>(
      `UPDATE inventory_items
       SET category_id = COALESCE($3, category_id),
           name = COALESCE($4, name),
           sku = COALESCE($5, sku),
           unit = COALESCE($6, unit),
           minimum_stock = COALESCE($7, minimum_stock),
           current_cost = COALESCE($8, current_cost),
           serial_number = COALESCE($9, serial_number),
           brand = COALESCE($10, brand),
           model = COALESCE($11, model)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.categoryId ?? null,
        data.name ?? null,
        data.sku ?? null,
        data.unit ?? null,
        data.minimumStock ?? null,
        data.currentCost ?? null,
        data.serialNumber ?? null,
        data.brand ?? null,
        data.model ?? null,
      ],
      client,
    );
    return result.rows[0] ?? null;
  }

  async setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<InventoryItemRow | null> {
    const result = await this.db.query<InventoryItemRow>(
      `UPDATE inventory_items SET is_active = $3
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, isActive],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<InventoryItemRow | null> {
    const result = await this.db.query<InventoryItemRow>(
      `UPDATE inventory_items SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }

  async existsBySku(
    businessId: string,
    sku: string,
    excludeId?: string,
  ): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM inventory_items
       WHERE business_id = $1 AND sku = $2 AND deleted_at IS NULL
         AND ($3::uuid IS NULL OR id != $3)`,
      [businessId, sku, excludeId ?? null],
    );
    return result.rows.length > 0;
  }
}
