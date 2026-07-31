import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { ContentItemRow } from '../domain/marketing.interface';
import {
  ContentItemQuery,
  CreateContentItemData,
  UpdateContentItemData,
} from '../domain/marketing.types';
import { IContentItemsRepository } from './content-items.repository.interface';

const SELECT_COLUMNS = `id, business_id, scheduled_date, title, channel, status, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class ContentItemsRepository implements IContentItemsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateContentItemData,
    client?: DbClient,
  ): Promise<ContentItemRow> {
    const result = await this.db.query<ContentItemRow>(
      `INSERT INTO marketing_content_items (business_id, scheduled_date, title, channel)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_COLUMNS}`,
      [data.businessId, data.scheduledDate, data.title, data.channel],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ContentItemRow | null> {
    const result = await this.db.query<ContentItemRow>(
      `SELECT ${SELECT_COLUMNS} FROM marketing_content_items
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: ContentItemQuery,
  ): Promise<{ rows: ContentItemRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.status) {
      params.push(query.status);
      conditions.push(`status = $${params.length}`);
    }

    if (query.channel) {
      params.push(query.channel);
      conditions.push(`channel = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM marketing_content_items WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<ContentItemRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM marketing_content_items
       WHERE ${whereClause}
       ORDER BY scheduled_date
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateContentItemData,
  ): Promise<ContentItemRow | null> {
    const result = await this.db.query<ContentItemRow>(
      `UPDATE marketing_content_items
       SET scheduled_date = COALESCE($3, scheduled_date),
           title = COALESCE($4, title),
           channel = COALESCE($5, channel),
           status = COALESCE($6, status)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.scheduledDate ?? null,
        data.title ?? null,
        data.channel ?? null,
        data.status ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<ContentItemRow | null> {
    const result = await this.db.query<ContentItemRow>(
      `UPDATE marketing_content_items SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }
}
