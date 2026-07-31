import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { PermissionRow } from '../domain/permission.interface';
import { IPermissionsRepository } from './permissions.repository.interface';

@Injectable()
export class PermissionsRepository implements IPermissionsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(client?: DbClient): Promise<PermissionRow[]> {
    const result = await this.db.query<PermissionRow>(
      `SELECT id, code, module, description, created_at
       FROM permissions
       ORDER BY module, code`,
      [],
      client,
    );
    return result.rows;
  }

  async findByCodes(
    codes: string[],
    client?: DbClient,
  ): Promise<PermissionRow[]> {
    if (codes.length === 0) {
      return [];
    }
    const result = await this.db.query<PermissionRow>(
      `SELECT id, code, module, description, created_at
       FROM permissions
       WHERE code = ANY($1::varchar[])`,
      [codes],
      client,
    );
    return result.rows;
  }
}
