import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { CreateInventoryQueryTemplateData, InventoryQueryTemplateRow } from '../domain/inventory-query.types';
import { IInventoryQueryTemplatesRepository } from './inventory-query-templates.repository.interface';

const SELECT_COLUMNS = `id, business_id, name, conditions, intent, created_by, created_at, updated_at`;

@Injectable()
export class InventoryQueryTemplatesRepository implements IInventoryQueryTemplatesRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateInventoryQueryTemplateData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<InventoryQueryTemplateRow> {
    const result = await this.db.query<InventoryQueryTemplateRow>(
      `INSERT INTO inventory_query_templates (business_id, name, conditions, intent, created_by)
       VALUES ($1, $2, $3::jsonb, $4, $5)
       RETURNING ${SELECT_COLUMNS}`,
      [data.businessId, data.name, JSON.stringify(data.conditions), data.intent, createdBy ?? null],
      client,
    );
    return result.rows[0];
  }

  async findAll(businessId: string): Promise<InventoryQueryTemplateRow[]> {
    const result = await this.db.query<InventoryQueryTemplateRow>(
      `SELECT ${SELECT_COLUMNS} FROM inventory_query_templates WHERE business_id = $1 ORDER BY name`,
      [businessId],
    );
    return result.rows;
  }

  async findById(id: string, businessId: string): Promise<InventoryQueryTemplateRow | null> {
    const result = await this.db.query<InventoryQueryTemplateRow>(
      `SELECT ${SELECT_COLUMNS} FROM inventory_query_templates WHERE id = $1 AND business_id = $2`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }

  async delete(id: string, businessId: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM inventory_query_templates WHERE id = $1 AND business_id = $2`,
      [id, businessId],
    );
    return result.rowCount > 0;
  }
}
