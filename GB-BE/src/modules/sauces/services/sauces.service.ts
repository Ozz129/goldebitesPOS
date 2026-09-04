import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { Sauce, SauceRow } from '../domain/sauce.interface';
import {
  CreateSauceData,
  SauceQuery,
  UpdateSauceData,
} from '../domain/sauce.types';
import { SauceMapper } from '../mappers/sauce.mapper';
import { SAUCES_REPOSITORY } from '../repositories/sauces.repository.interface';
import type { ISaucesRepository } from '../repositories/sauces.repository.interface';

@Injectable()
export class SaucesService {
  constructor(
    @Inject(SAUCES_REPOSITORY)
    private readonly saucesRepository: ISaucesRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(data: CreateSauceData, actorUserId?: string): Promise<Sauce> {
    const nameTaken = await this.saucesRepository.existsByName(
      data.businessId,
      data.name,
    );
    if (nameTaken) {
      throw new ConflictException(
        `A sauce named "${data.name}" already exists`,
        'SAUCE_NAME_TAKEN',
      );
    }

    const row = await this.saucesRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'sauce',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name },
    });
    return SauceMapper.toDomain(row);
  }

  async findAll(query: SauceQuery): Promise<PaginatedResult<Sauce>> {
    const { rows, total } = await this.saucesRepository.findAll(query);
    return {
      data: rows.map((row) => SauceMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(businessId: string, id: string): Promise<Sauce> {
    const row = await this.getOwnedOrFail(businessId, id);
    return SauceMapper.toDomain(row);
  }

  async findByIds(businessId: string, ids: string[]): Promise<Sauce[]> {
    const rows = await this.saucesRepository.findByIds(businessId, ids);
    return rows.map((row) => SauceMapper.toDomain(row));
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateSauceData,
    actorUserId?: string,
  ): Promise<Sauce> {
    await this.getOwnedOrFail(businessId, id);

    if (data.name) {
      const nameTaken = await this.saucesRepository.existsByName(
        businessId,
        data.name,
        id,
      );
      if (nameTaken) {
        throw new ConflictException(
          `A sauce named "${data.name}" already exists`,
          'SAUCE_NAME_TAKEN',
        );
      }
    }

    const row = await this.saucesRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('Sauce', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'sauce',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return SauceMapper.toDomain(row);
  }

  async setActive(
    businessId: string,
    id: string,
    isActive: boolean,
    actorUserId?: string,
  ): Promise<Sauce> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.saucesRepository.setActive(id, businessId, isActive);
    if (!row) {
      throw new EntityNotFoundException('Sauce', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'sauce',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    });
    return SauceMapper.toDomain(row);
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<SauceRow> {
    const row = await this.saucesRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Sauce', id);
    }
    return row;
  }
}
