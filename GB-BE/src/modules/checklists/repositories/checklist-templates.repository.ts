import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import {
  ChecklistTemplateItemRow,
  ChecklistTemplateRow,
} from '../domain/checklist.interface';
import {
  ChecklistTemplateQuery,
  CreateChecklistTemplateData,
  TemplateItemInput,
  UpdateChecklistTemplateData,
} from '../domain/checklist.types';
import { IChecklistTemplatesRepository } from './checklist-templates.repository.interface';

const SELECT_COLUMNS = `id, business_id, type, name, is_active, created_at, updated_at, deleted_at`;
const ITEM_COLUMNS = `id, template_id, label, display_order`;

interface CountRow {
  count: string;
}

@Injectable()
export class ChecklistTemplatesRepository implements IChecklistTemplatesRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateChecklistTemplateData,
    client?: DbClient,
  ): Promise<ChecklistTemplateRow> {
    const result = await this.db.query<ChecklistTemplateRow>(
      `INSERT INTO checklist_templates (business_id, type, name)
       VALUES ($1, $2, $3)
       RETURNING ${SELECT_COLUMNS}`,
      [data.businessId, data.type, data.name],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ChecklistTemplateRow | null> {
    const result = await this.db.query<ChecklistTemplateRow>(
      `SELECT ${SELECT_COLUMNS} FROM checklist_templates WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: ChecklistTemplateQuery,
  ): Promise<{ rows: ChecklistTemplateRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.type) {
      params.push(query.type);
      conditions.push(`type = $${params.length}`);
    }

    if (query.isActive !== undefined) {
      params.push(query.isActive);
      conditions.push(`is_active = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM checklist_templates WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<ChecklistTemplateRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM checklist_templates
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
    data: UpdateChecklistTemplateData,
    client?: DbClient,
  ): Promise<ChecklistTemplateRow | null> {
    const result = await this.db.query<ChecklistTemplateRow>(
      `UPDATE checklist_templates
       SET type = COALESCE($3, type),
           name = COALESCE($4, name)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, data.type ?? null, data.name ?? null],
      client,
    );
    return result.rows[0] ?? null;
  }

  async setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<ChecklistTemplateRow | null> {
    const result = await this.db.query<ChecklistTemplateRow>(
      `UPDATE checklist_templates SET is_active = $3
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, isActive],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<ChecklistTemplateRow | null> {
    const result = await this.db.query<ChecklistTemplateRow>(
      `UPDATE checklist_templates SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }

  async findItems(
    templateId: string,
    client?: DbClient,
  ): Promise<ChecklistTemplateItemRow[]> {
    const result = await this.db.query<ChecklistTemplateItemRow>(
      `SELECT ${ITEM_COLUMNS} FROM checklist_template_items WHERE template_id = $1 ORDER BY display_order`,
      [templateId],
      client,
    );
    return result.rows;
  }

  async addItems(
    templateId: string,
    items: TemplateItemInput[],
    client?: DbClient,
  ): Promise<ChecklistTemplateItemRow[]> {
    const inserted: ChecklistTemplateItemRow[] = [];
    for (const [index, item] of items.entries()) {
      const result = await this.db.query<ChecklistTemplateItemRow>(
        `INSERT INTO checklist_template_items (template_id, label, display_order)
         VALUES ($1, $2, $3)
         RETURNING ${ITEM_COLUMNS}`,
        [templateId, item.label, index],
        client,
      );
      inserted.push(result.rows[0]);
    }
    return inserted;
  }

  async replaceItems(
    templateId: string,
    items: TemplateItemInput[],
    client?: DbClient,
  ): Promise<ChecklistTemplateItemRow[]> {
    await this.db.query(
      `DELETE FROM checklist_template_items WHERE template_id = $1`,
      [templateId],
      client,
    );
    return this.addItems(templateId, items, client);
  }
}
