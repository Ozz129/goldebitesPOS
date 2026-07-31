import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { CouponRow } from '../domain/marketing.interface';
import {
  CouponQuery,
  CreateCouponData,
  UpdateCouponData,
} from '../domain/marketing.types';
import { ICouponsRepository } from './coupons.repository.interface';

const SELECT_COLUMNS = `id, business_id, code, discount_label, usage_count, max_usage, is_active, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class CouponsRepository implements ICouponsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateCouponData, client?: DbClient): Promise<CouponRow> {
    const result = await this.db.query<CouponRow>(
      `INSERT INTO marketing_coupons (business_id, code, discount_label, max_usage)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.code.toUpperCase(),
        data.discountLabel,
        data.maxUsage,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<CouponRow | null> {
    const result = await this.db.query<CouponRow>(
      `SELECT ${SELECT_COLUMNS} FROM marketing_coupons
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: CouponQuery,
  ): Promise<{ rows: CouponRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.isActive !== undefined) {
      params.push(query.isActive);
      conditions.push(`is_active = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM marketing_coupons WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<CouponRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM marketing_coupons
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
    data: UpdateCouponData,
  ): Promise<CouponRow | null> {
    const result = await this.db.query<CouponRow>(
      `UPDATE marketing_coupons
       SET code = COALESCE($3, code),
           discount_label = COALESCE($4, discount_label),
           usage_count = COALESCE($5, usage_count),
           max_usage = COALESCE($6, max_usage)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.code ? data.code.toUpperCase() : null,
        data.discountLabel ?? null,
        data.usageCount ?? null,
        data.maxUsage ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<CouponRow | null> {
    const result = await this.db.query<CouponRow>(
      `UPDATE marketing_coupons SET is_active = $3
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, isActive],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(id: string, businessId: string): Promise<CouponRow | null> {
    const result = await this.db.query<CouponRow>(
      `UPDATE marketing_coupons SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }
}
