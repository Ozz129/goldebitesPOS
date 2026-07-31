import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { LoyaltyMovementRow } from '../domain/loyalty.interface';
import { LoyaltyMovementQuery } from '../domain/loyalty.types';
import {
  CreateLoyaltyMovementData,
  ILoyaltyMovementsRepository,
} from './loyalty-movements.repository.interface';

const SELECT_COLUMNS = `id, business_id, customer_id, reward_id, type, points, description, created_by, created_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class LoyaltyMovementsRepository implements ILoyaltyMovementsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateLoyaltyMovementData,
    actorUserId: string | undefined,
    client?: DbClient,
  ): Promise<LoyaltyMovementRow> {
    const result = await this.db.query<LoyaltyMovementRow>(
      `INSERT INTO loyalty_movements (business_id, customer_id, reward_id, type, points, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.customerId,
        data.rewardId ?? null,
        data.type,
        data.points,
        data.description,
        actorUserId ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findAll(
    query: LoyaltyMovementQuery,
  ): Promise<{ rows: LoyaltyMovementRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.customerId) {
      params.push(query.customerId);
      conditions.push(`customer_id = $${params.length}`);
    }

    if (query.type) {
      params.push(query.type);
      conditions.push(`type = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM loyalty_movements WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<LoyaltyMovementRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM loyalty_movements
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }
}
