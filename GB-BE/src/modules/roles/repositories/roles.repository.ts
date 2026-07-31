import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { RoleRow } from '../domain/role.interface';
import { CreateRoleData, UpdateRoleData } from '../domain/role.types';
import { IRolesRepository } from './roles.repository.interface';

interface PermissionCodeRow {
  code: string;
}

interface CountRow {
  count: string;
}

@Injectable()
export class RolesRepository implements IRolesRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateRoleData, client?: DbClient): Promise<RoleRow> {
    const result = await this.db.query<RoleRow>(
      `INSERT INTO roles (business_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, business_id, name, description, created_at`,
      [data.businessId, data.name, data.description ?? null],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<RoleRow | null> {
    const result = await this.db.query<RoleRow>(
      `SELECT id, business_id, name, description, created_at
       FROM roles
       WHERE id = $1 AND business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findByName(
    businessId: string,
    name: string,
    client?: DbClient,
  ): Promise<RoleRow | null> {
    const result = await this.db.query<RoleRow>(
      `SELECT id, business_id, name, description, created_at
       FROM roles
       WHERE business_id = $1 AND name = $2`,
      [businessId, name],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAllByBusiness(
    businessId: string,
    client?: DbClient,
  ): Promise<RoleRow[]> {
    const result = await this.db.query<RoleRow>(
      `SELECT id, business_id, name, description, created_at
       FROM roles
       WHERE business_id = $1
       ORDER BY name`,
      [businessId],
      client,
    );
    return result.rows;
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateRoleData,
    client?: DbClient,
  ): Promise<RoleRow | null> {
    const result = await this.db.query<RoleRow>(
      `UPDATE roles
       SET name = COALESCE($3, name),
           description = COALESCE($4, description)
       WHERE id = $1 AND business_id = $2
       RETURNING id, business_id, name, description, created_at`,
      [id, businessId, data.name ?? null, data.description ?? null],
      client,
    );
    return result.rows[0] ?? null;
  }

  async getPermissionCodes(
    roleId: string,
    client?: DbClient,
  ): Promise<string[]> {
    const result = await this.db.query<PermissionCodeRow>(
      `SELECT p.code
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = $1
       ORDER BY p.code`,
      [roleId],
      client,
    );
    return result.rows.map((row) => row.code);
  }

  async replacePermissions(
    roleId: string,
    permissionIds: string[],
    client?: DbClient,
  ): Promise<void> {
    await this.db.query(
      'DELETE FROM role_permissions WHERE role_id = $1',
      [roleId],
      client,
    );

    if (permissionIds.length === 0) {
      return;
    }

    await this.db.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, unnest($2::uuid[])`,
      [roleId, permissionIds],
      client,
    );
  }

  async countUsersWithRole(roleId: string, client?: DbClient): Promise<number> {
    const result = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM users WHERE role_id = $1 AND deleted_at IS NULL`,
      [roleId],
      client,
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }
}
