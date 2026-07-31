import { DbClient } from '../../../database/types/database.types';
import { RoleRow } from '../domain/role.interface';
import { CreateRoleData, UpdateRoleData } from '../domain/role.types';

export interface IRolesRepository {
  create(data: CreateRoleData, client?: DbClient): Promise<RoleRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<RoleRow | null>;
  findByName(
    businessId: string,
    name: string,
    client?: DbClient,
  ): Promise<RoleRow | null>;
  findAllByBusiness(businessId: string, client?: DbClient): Promise<RoleRow[]>;
  update(
    id: string,
    businessId: string,
    data: UpdateRoleData,
    client?: DbClient,
  ): Promise<RoleRow | null>;
  getPermissionCodes(roleId: string, client?: DbClient): Promise<string[]>;
  replacePermissions(
    roleId: string,
    permissionIds: string[],
    client?: DbClient,
  ): Promise<void>;
  countUsersWithRole(roleId: string, client?: DbClient): Promise<number>;
}

export const ROLES_REPOSITORY = Symbol('ROLES_REPOSITORY');
