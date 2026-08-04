import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { UserRow } from '../domain/user.interface';
import {
  CreateUserData,
  UpdateUserData,
  UserQuery,
  UserStatus,
} from '../domain/user.types';
import { IUsersRepository } from './users.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, role_id, first_name, last_name, email,
  password_hash, phone, status, is_platform_admin, last_login_at, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateUserData, client?: DbClient): Promise<UserRow> {
    const result = await this.db.query<UserRow>(
      `INSERT INTO users (business_id, branch_id, role_id, first_name, last_name, email, password_hash, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.branchId ?? null,
        data.roleId,
        data.firstName,
        data.lastName,
        data.email,
        data.passwordHash,
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
  ): Promise<UserRow | null> {
    const result = await this.db.query<UserRow>(
      `SELECT ${SELECT_COLUMNS} FROM users
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findByIdUnscoped(
    id: string,
    client?: DbClient,
  ): Promise<UserRow | null> {
    const result = await this.db.query<UserRow>(
      `SELECT ${SELECT_COLUMNS} FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findActiveByEmailAcrossBusinesses(
    email: string,
    client?: DbClient,
  ): Promise<UserRow[]> {
    const result = await this.db.query<UserRow>(
      `SELECT ${SELECT_COLUMNS} FROM users
       WHERE email = $1 AND deleted_at IS NULL
       ORDER BY created_at ASC`,
      [email],
      client,
    );
    return result.rows;
  }

  async findAll(query: UserQuery): Promise<{ rows: UserRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.status) {
      params.push(query.status);
      conditions.push(`status = $${params.length}`);
    }

    if (query.roleId) {
      params.push(query.roleId);
      conditions.push(`role_id = $${params.length}`);
    }

    if (query.branchId) {
      params.push(query.branchId);
      conditions.push(`branch_id = $${params.length}`);
    }

    if (query.search) {
      params.push(`%${query.search}%`);
      const idx = params.length;
      conditions.push(
        `(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR email ILIKE $${idx})`,
      );
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM users WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<UserRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM users
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
    data: UpdateUserData,
    client?: DbClient,
  ): Promise<UserRow | null> {
    const result = await this.db.query<UserRow>(
      `UPDATE users
       SET branch_id = COALESCE($3, branch_id),
           role_id = COALESCE($4, role_id),
           first_name = COALESCE($5, first_name),
           last_name = COALESCE($6, last_name),
           phone = COALESCE($7, phone)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.branchId ?? null,
        data.roleId ?? null,
        data.firstName ?? null,
        data.lastName ?? null,
        data.phone ?? null,
      ],
      client,
    );
    return result.rows[0] ?? null;
  }

  async updatePasswordHash(
    id: string,
    passwordHash: string,
    client?: DbClient,
  ): Promise<void> {
    await this.db.query(
      'UPDATE users SET password_hash = $2 WHERE id = $1',
      [id, passwordHash],
      client,
    );
  }

  async updateLastLoginAt(id: string, client?: DbClient): Promise<void> {
    await this.db.query(
      'UPDATE users SET last_login_at = now() WHERE id = $1',
      [id],
      client,
    );
  }

  async setStatus(
    id: string,
    businessId: string,
    status: UserStatus,
    client?: DbClient,
  ): Promise<UserRow | null> {
    const result = await this.db.query<UserRow>(
      `UPDATE users SET status = $3
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, status],
      client,
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<UserRow | null> {
    const result = await this.db.query<UserRow>(
      `UPDATE users SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async existsByEmailInBusiness(
    businessId: string,
    email: string,
    excludeId?: string,
  ): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM users
       WHERE business_id = $1 AND email = $2 AND deleted_at IS NULL
         AND ($3::uuid IS NULL OR id != $3)`,
      [businessId, email, excludeId ?? null],
    );
    return result.rows.length > 0;
  }
}
