import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { CampaignRow } from '../domain/marketing.interface';
import {
  CampaignQuery,
  CreateCampaignData,
  UpdateCampaignData,
} from '../domain/marketing.types';
import { ICampaignsRepository } from './campaigns.repository.interface';

const SELECT_COLUMNS = `id, business_id, name, channel, status, budget, spent, reach, clicks, conversions, start_date, end_date, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class CampaignsRepository implements ICampaignsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateCampaignData,
    client?: DbClient,
  ): Promise<CampaignRow> {
    const result = await this.db.query<CampaignRow>(
      `INSERT INTO marketing_campaigns (business_id, name, channel, budget, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.name,
        data.channel,
        data.budget,
        data.startDate ?? null,
        data.endDate ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<CampaignRow | null> {
    const result = await this.db.query<CampaignRow>(
      `SELECT ${SELECT_COLUMNS} FROM marketing_campaigns
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: CampaignQuery,
  ): Promise<{ rows: CampaignRow[]; total: number }> {
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
      `SELECT COUNT(*)::text AS count FROM marketing_campaigns WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<CampaignRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM marketing_campaigns
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateCampaignData,
  ): Promise<CampaignRow | null> {
    const result = await this.db.query<CampaignRow>(
      `UPDATE marketing_campaigns
       SET name = COALESCE($3, name),
           channel = COALESCE($4, channel),
           status = COALESCE($5, status),
           budget = COALESCE($6, budget),
           spent = COALESCE($7, spent),
           reach = COALESCE($8, reach),
           clicks = COALESCE($9, clicks),
           conversions = COALESCE($10, conversions),
           start_date = COALESCE($11, start_date),
           end_date = COALESCE($12, end_date)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.name ?? null,
        data.channel ?? null,
        data.status ?? null,
        data.budget ?? null,
        data.spent ?? null,
        data.reach ?? null,
        data.clicks ?? null,
        data.conversions ?? null,
        data.startDate ?? null,
        data.endDate ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<CampaignRow | null> {
    const result = await this.db.query<CampaignRow>(
      `UPDATE marketing_campaigns SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }
}
