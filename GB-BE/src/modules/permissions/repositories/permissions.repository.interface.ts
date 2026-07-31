import { DbClient } from '../../../database/types/database.types';
import { PermissionRow } from '../domain/permission.interface';

export interface IPermissionsRepository {
  findAll(client?: DbClient): Promise<PermissionRow[]>;
  findByCodes(codes: string[], client?: DbClient): Promise<PermissionRow[]>;
}

export const PERMISSIONS_REPOSITORY = Symbol('PERMISSIONS_REPOSITORY');
