import { Inject, Injectable } from '@nestjs/common';
import { Permission } from '../domain/permission.interface';
import { PermissionMapper } from '../mappers/permission.mapper';
import { PERMISSIONS_REPOSITORY } from '../repositories/permissions.repository.interface';
import type { IPermissionsRepository } from '../repositories/permissions.repository.interface';

@Injectable()
export class PermissionsService {
  constructor(
    @Inject(PERMISSIONS_REPOSITORY)
    private readonly permissionsRepository: IPermissionsRepository,
  ) {}

  async findAll(): Promise<Permission[]> {
    const rows = await this.permissionsRepository.findAll();
    return rows.map((row) => PermissionMapper.toDomain(row));
  }
}
