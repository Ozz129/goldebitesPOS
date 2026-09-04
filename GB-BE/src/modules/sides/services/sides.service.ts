import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { Side, SideRow } from '../domain/side.interface';
import {
  CreateSideData,
  SideQuery,
  UpdateSideData,
} from '../domain/side.types';
import { SideMapper } from '../mappers/side.mapper';
import { SIDES_REPOSITORY } from '../repositories/sides.repository.interface';
import type { ISidesRepository } from '../repositories/sides.repository.interface';

@Injectable()
export class SidesService {
  constructor(
    @Inject(SIDES_REPOSITORY)
    private readonly sidesRepository: ISidesRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(data: CreateSideData, actorUserId?: string): Promise<Side> {
    const nameTaken = await this.sidesRepository.existsByName(
      data.businessId,
      data.name,
    );
    if (nameTaken) {
      throw new ConflictException(
        `A side named "${data.name}" already exists`,
        'SIDE_NAME_TAKEN',
      );
    }

    const row = await this.sidesRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'side',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name },
    });
    return SideMapper.toDomain(row);
  }

  async findAll(query: SideQuery): Promise<PaginatedResult<Side>> {
    const { rows, total } = await this.sidesRepository.findAll(query);
    return {
      data: rows.map((row) => SideMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(businessId: string, id: string): Promise<Side> {
    const row = await this.getOwnedOrFail(businessId, id);
    return SideMapper.toDomain(row);
  }

  async findByIds(businessId: string, ids: string[]): Promise<Side[]> {
    const rows = await this.sidesRepository.findByIds(businessId, ids);
    return rows.map((row) => SideMapper.toDomain(row));
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateSideData,
    actorUserId?: string,
  ): Promise<Side> {
    await this.getOwnedOrFail(businessId, id);

    if (data.name) {
      const nameTaken = await this.sidesRepository.existsByName(
        businessId,
        data.name,
        id,
      );
      if (nameTaken) {
        throw new ConflictException(
          `A side named "${data.name}" already exists`,
          'SIDE_NAME_TAKEN',
        );
      }
    }

    const row = await this.sidesRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('Side', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'side',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return SideMapper.toDomain(row);
  }

  async setActive(
    businessId: string,
    id: string,
    isActive: boolean,
    actorUserId?: string,
  ): Promise<Side> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.sidesRepository.setActive(id, businessId, isActive);
    if (!row) {
      throw new EntityNotFoundException('Side', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'side',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    });
    return SideMapper.toDomain(row);
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<SideRow> {
    const row = await this.sidesRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Side', id);
    }
    return row;
  }
}
