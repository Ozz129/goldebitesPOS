import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { BranchRow } from '../domain/branch.interface';
import {
  BranchQuery,
  CreateBranchData,
  UpdateBranchData,
} from '../domain/branch.types';
import { IBranchesRepository } from './branches.repository.interface';

const SELECT_COLUMNS = `id, business_id, name, address, city, phone, is_active, created_at, updated_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class BranchesRepository implements IBranchesRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateBranchData, client?: DbClient): Promise<BranchRow> {
    const result = await this.db.query<BranchRow>(
      `INSERT INTO branches (business_id, name, address, city, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.name,
        data.address ?? null,
        data.city ?? null,
        data.phone ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<BranchRow | null> {
    const result = await this.db.query<BranchRow>(
      `SELECT ${SELECT_COLUMNS} FROM branches WHERE id = $1 AND business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: BranchQuery,
  ): Promise<{ rows: BranchRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.isActive !== undefined) {
      params.push(query.isActive);
      conditions.push(`is_active = $${params.length}`);
    }

    if (query.search) {
      params.push(`%${query.search}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM branches WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<BranchRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM branches
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
    data: UpdateBranchData,
    client?: DbClient,
  ): Promise<BranchRow | null> {
    const result = await this.db.query<BranchRow>(
      `UPDATE branches
       SET name = COALESCE($3, name),
           address = COALESCE($4, address),
           city = COALESCE($5, city),
           phone = COALESCE($6, phone)
       WHERE id = $1 AND business_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.name ?? null,
        data.address ?? null,
        data.city ?? null,
        data.phone ?? null,
      ],
      client,
    );
    return result.rows[0] ?? null;
  }

  async setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<BranchRow | null> {
    const result = await this.db.query<BranchRow>(
      `UPDATE branches SET is_active = $3 WHERE id = $1 AND business_id = $2 RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, isActive],
    );
    return result.rows[0] ?? null;
  }

  async existsByName(
    businessId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM branches WHERE business_id = $1 AND name = $2 AND ($3::uuid IS NULL OR id != $3)`,
      [businessId, name, excludeId ?? null],
    );
    return result.rows.length > 0;
  }
}
