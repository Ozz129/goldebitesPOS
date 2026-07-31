import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import {
  InventoryLocation,
  InventoryLocationRow,
} from '../domain/inventory-location.interface';
import {
  CreateInventoryLocationData,
  InventoryLocationQuery,
  UpdateInventoryLocationData,
} from '../domain/inventory-location.types';
import { InventoryLocationMapper } from '../mappers/inventory-location.mapper';
import { INVENTORY_LOCATIONS_REPOSITORY } from '../repositories/inventory-locations.repository.interface';
import type { IInventoryLocationsRepository } from '../repositories/inventory-locations.repository.interface';

@Injectable()
export class InventoryLocationsService {
  constructor(
    @Inject(INVENTORY_LOCATIONS_REPOSITORY)
    private readonly locationsRepository: IInventoryLocationsRepository,
    private readonly branchesService: BranchesService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    businessId: string,
    data: CreateInventoryLocationData,
    actorUserId?: string,
  ): Promise<InventoryLocation> {
    await this.branchesService.findOne(businessId, data.branchId);

    const nameTaken = await this.locationsRepository.existsByName(
      data.branchId,
      data.name,
    );
    if (nameTaken) {
      throw new ConflictException(
        `A location named "${data.name}" already exists in this branch`,
        'LOCATION_NAME_TAKEN',
      );
    }

    const row = await this.locationsRepository.create(data);
    await this.auditService.record({
      businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'inventory_location',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name },
    });
    return InventoryLocationMapper.toDomain(row);
  }

  async findAll(
    businessId: string,
    query: InventoryLocationQuery,
  ): Promise<PaginatedResult<InventoryLocation>> {
    await this.branchesService.findOne(businessId, query.branchId);
    const { rows, total } = await this.locationsRepository.findAll(query);
    return {
      data: rows.map((row) => InventoryLocationMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    branchId: string,
    id: string,
  ): Promise<InventoryLocation> {
    await this.branchesService.findOne(businessId, branchId);
    const row = await this.getOwnedOrFail(branchId, id);
    return InventoryLocationMapper.toDomain(row);
  }

  async update(
    businessId: string,
    branchId: string,
    id: string,
    data: UpdateInventoryLocationData,
    actorUserId?: string,
  ): Promise<InventoryLocation> {
    await this.branchesService.findOne(businessId, branchId);
    await this.getOwnedOrFail(branchId, id);

    if (data.name) {
      const nameTaken = await this.locationsRepository.existsByName(
        branchId,
        data.name,
        id,
      );
      if (nameTaken) {
        throw new ConflictException(
          `A location named "${data.name}" already exists in this branch`,
          'LOCATION_NAME_TAKEN',
        );
      }
    }

    const row = await this.locationsRepository.update(id, branchId, data);
    if (!row) {
      throw new EntityNotFoundException('InventoryLocation', id);
    }
    await this.auditService.record({
      businessId,
      branchId,
      userId: actorUserId,
      entityType: 'inventory_location',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return InventoryLocationMapper.toDomain(row);
  }

  async setActive(
    businessId: string,
    branchId: string,
    id: string,
    isActive: boolean,
    actorUserId?: string,
  ): Promise<InventoryLocation> {
    await this.branchesService.findOne(businessId, branchId);
    await this.getOwnedOrFail(branchId, id);
    const row = await this.locationsRepository.setActive(
      id,
      branchId,
      isActive,
    );
    if (!row) {
      throw new EntityNotFoundException('InventoryLocation', id);
    }
    await this.auditService.record({
      businessId,
      branchId,
      userId: actorUserId,
      entityType: 'inventory_location',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    });
    return InventoryLocationMapper.toDomain(row);
  }

  private async getOwnedOrFail(
    branchId: string,
    id: string,
  ): Promise<InventoryLocationRow> {
    const row = await this.locationsRepository.findById(id, branchId);
    if (!row) {
      throw new EntityNotFoundException('InventoryLocation', id);
    }
    return row;
  }
}
