import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { LoyaltyRewardRow } from '../domain/loyalty.interface';
import {
  CreateLoyaltyRewardData,
  LoyaltyRewardQuery,
  UpdateLoyaltyRewardData,
} from '../domain/loyalty.types';
import { ILoyaltyRewardsRepository } from './loyalty-rewards.repository.interface';

const SELECT_COLUMNS = `id, business_id, name, description, points_cost, is_active, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class LoyaltyRewardsRepository implements ILoyaltyRewardsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateLoyaltyRewardData,
    client?: DbClient,
  ): Promise<LoyaltyRewardRow> {
    const result = await this.db.query<LoyaltyRewardRow>(
      `INSERT INTO loyalty_rewards (business_id, name, description, points_cost)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_COLUMNS}`,
      [data.businessId, data.name, data.description ?? null, data.pointsCost],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<LoyaltyRewardRow | null> {
    const result = await this.db.query<LoyaltyRewardRow>(
      `SELECT ${SELECT_COLUMNS} FROM loyalty_rewards
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: LoyaltyRewardQuery,
  ): Promise<{ rows: LoyaltyRewardRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.isActive !== undefined) {
      params.push(query.isActive);
      conditions.push(`is_active = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM loyalty_rewards WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<LoyaltyRewardRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM loyalty_rewards
       WHERE ${whereClause}
       ORDER BY points_cost
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateLoyaltyRewardData,
  ): Promise<LoyaltyRewardRow | null> {
    const result = await this.db.query<LoyaltyRewardRow>(
      `UPDATE loyalty_rewards
       SET name = COALESCE($3, name),
           description = COALESCE($4, description),
           points_cost = COALESCE($5, points_cost)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.name ?? null,
        data.description ?? null,
        data.pointsCost ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<LoyaltyRewardRow | null> {
    const result = await this.db.query<LoyaltyRewardRow>(
      `UPDATE loyalty_rewards SET is_active = $3
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, isActive],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<LoyaltyRewardRow | null> {
    const result = await this.db.query<LoyaltyRewardRow>(
      `UPDATE loyalty_rewards SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }
}
