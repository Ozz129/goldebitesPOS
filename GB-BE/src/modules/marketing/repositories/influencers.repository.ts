import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { InfluencerRow } from '../domain/marketing.interface';
import {
  CreateInfluencerData,
  InfluencerQuery,
  UpdateInfluencerData,
} from '../domain/marketing.types';
import { IInfluencersRepository } from './influencers.repository.interface';

const SELECT_COLUMNS = `id, business_id, name, channel, followers, status, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class InfluencersRepository implements IInfluencersRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateInfluencerData,
    client?: DbClient,
  ): Promise<InfluencerRow> {
    const result = await this.db.query<InfluencerRow>(
      `INSERT INTO marketing_influencers (business_id, name, channel, followers)
       VALUES ($1, $2, $3, COALESCE($4, 0))
       RETURNING ${SELECT_COLUMNS}`,
      [data.businessId, data.name, data.channel, data.followers ?? null],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<InfluencerRow | null> {
    const result = await this.db.query<InfluencerRow>(
      `SELECT ${SELECT_COLUMNS} FROM marketing_influencers
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: InfluencerQuery,
  ): Promise<{ rows: InfluencerRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.status) {
      params.push(query.status);
      conditions.push(`status = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM marketing_influencers WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<InfluencerRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM marketing_influencers
       WHERE ${whereClause}
       ORDER BY followers DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateInfluencerData,
  ): Promise<InfluencerRow | null> {
    const result = await this.db.query<InfluencerRow>(
      `UPDATE marketing_influencers
       SET name = COALESCE($3, name),
           channel = COALESCE($4, channel),
           followers = COALESCE($5, followers),
           status = COALESCE($6, status)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.name ?? null,
        data.channel ?? null,
        data.followers ?? null,
        data.status ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<InfluencerRow | null> {
    const result = await this.db.query<InfluencerRow>(
      `UPDATE marketing_influencers SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }
}
