import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { DbClient } from '../../../database/types/database.types';
import { SYSTEM_ROLES } from '../../../common/constants/roles.constants';
import { DEFAULT_ROLE_PERMISSIONS } from '../../../common/constants/permissions.constants';
import { PERMISSIONS_REPOSITORY } from '../../permissions/repositories/permissions.repository.interface';
import type { IPermissionsRepository } from '../../permissions/repositories/permissions.repository.interface';
import { Role, RoleRow, RoleWithPermissions } from '../domain/role.interface';
import { CreateRoleData, UpdateRoleData } from '../domain/role.types';
import { RoleMapper } from '../mappers/role.mapper';
import { ROLES_REPOSITORY } from '../repositories/roles.repository.interface';
import type { IRolesRepository } from '../repositories/roles.repository.interface';

@Injectable()
export class RolesService {
  constructor(
    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,
    @Inject(PERMISSIONS_REPOSITORY)
    private readonly permissionsRepository: IPermissionsRepository,
  ) {}

  async create(data: CreateRoleData): Promise<Role> {
    const existing = await this.rolesRepository.findByName(
      data.businessId,
      data.name,
    );
    if (existing) {
      throw new ConflictException(
        `A role named "${data.name}" already exists`,
        'ROLE_NAME_TAKEN',
      );
    }
    const row = await this.rolesRepository.create(data);
    return RoleMapper.toDomain(row);
  }

  async findAllForBusiness(businessId: string): Promise<Role[]> {
    const rows = await this.rolesRepository.findAllByBusiness(businessId);
    return rows.map((row) => RoleMapper.toDomain(row));
  }

  async findOne(businessId: string, id: string): Promise<RoleWithPermissions> {
    const row = await this.getOwnedRoleOrFail(businessId, id);
    const permissions = await this.rolesRepository.getPermissionCodes(row.id);
    return { ...RoleMapper.toDomain(row), permissions };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateRoleData,
  ): Promise<Role> {
    await this.getOwnedRoleOrFail(businessId, id);

    if (data.name) {
      const existing = await this.rolesRepository.findByName(
        businessId,
        data.name,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `A role named "${data.name}" already exists`,
          'ROLE_NAME_TAKEN',
        );
      }
    }

    const row = await this.rolesRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('Role', id);
    }
    return RoleMapper.toDomain(row);
  }

  async setPermissions(
    businessId: string,
    id: string,
    permissionCodes: string[],
  ): Promise<string[]> {
    await this.getOwnedRoleOrFail(businessId, id);

    const uniqueCodes = [...new Set(permissionCodes)];
    const found = await this.permissionsRepository.findByCodes(uniqueCodes);

    if (found.length !== uniqueCodes.length) {
      const foundCodes = new Set(found.map((p) => p.code));
      const unknown = uniqueCodes.filter((code) => !foundCodes.has(code));
      throw new EntityNotFoundException('Permission', unknown.join(', '));
    }

    await this.rolesRepository.replacePermissions(
      id,
      found.map((p) => p.id),
    );
    return this.rolesRepository.getPermissionCodes(id);
  }

  /**
   * Bootstraps the fixed catalog of system roles (and their default
   * permission grants) for a newly created business. Must run inside the
   * same transaction as the business creation so a failure rolls back both.
   */
  async provisionSystemRoles(
    businessId: string,
    client: DbClient,
  ): Promise<Map<string, RoleRow>> {
    const rolesByName = new Map<string, RoleRow>();

    for (const roleName of SYSTEM_ROLES) {
      const role = await this.rolesRepository.create(
        { businessId, name: roleName },
        client,
      );
      rolesByName.set(roleName, role);

      const codes = DEFAULT_ROLE_PERMISSIONS[roleName];
      const permissionRows = await this.permissionsRepository.findByCodes(
        codes,
        client,
      );
      await this.rolesRepository.replacePermissions(
        role.id,
        permissionRows.map((p) => p.id),
        client,
      );
    }

    return rolesByName;
  }

  private async getOwnedRoleOrFail(
    businessId: string,
    id: string,
  ): Promise<RoleRow> {
    const row = await this.rolesRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Role', id);
    }
    return row;
  }
}
