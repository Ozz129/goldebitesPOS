import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { Branch, BranchRow } from '../domain/branch.interface';
import {
  BranchQuery,
  CreateBranchData,
  UpdateBranchData,
} from '../domain/branch.types';
import { BranchMapper } from '../mappers/branch.mapper';
import { BRANCHES_REPOSITORY } from '../repositories/branches.repository.interface';
import type { IBranchesRepository } from '../repositories/branches.repository.interface';

@Injectable()
export class BranchesService {
  constructor(
    @Inject(BRANCHES_REPOSITORY)
    private readonly branchesRepository: IBranchesRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(data: CreateBranchData, actorUserId?: string): Promise<Branch> {
    const nameTaken = await this.branchesRepository.existsByName(
      data.businessId,
      data.name,
    );
    if (nameTaken) {
      throw new ConflictException(
        `A branch named "${data.name}" already exists`,
        'BRANCH_NAME_TAKEN',
      );
    }

    const row = await this.branchesRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      branchId: row.id,
      userId: actorUserId,
      entityType: 'branch',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name },
    });
    return BranchMapper.toDomain(row);
  }

  async findAll(query: BranchQuery): Promise<PaginatedResult<Branch>> {
    const { rows, total } = await this.branchesRepository.findAll(query);
    return {
      data: rows.map((row) => BranchMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(businessId: string, id: string): Promise<Branch> {
    const row = await this.getOwnedBranchOrFail(businessId, id);
    return BranchMapper.toDomain(row);
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateBranchData,
    actorUserId?: string,
  ): Promise<Branch> {
    await this.getOwnedBranchOrFail(businessId, id);

    if (data.name) {
      const nameTaken = await this.branchesRepository.existsByName(
        businessId,
        data.name,
        id,
      );
      if (nameTaken) {
        throw new ConflictException(
          `A branch named "${data.name}" already exists`,
          'BRANCH_NAME_TAKEN',
        );
      }
    }

    const row = await this.branchesRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('Branch', id);
    }
    await this.auditService.record({
      businessId,
      branchId: id,
      userId: actorUserId,
      entityType: 'branch',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return BranchMapper.toDomain(row);
  }

  async setActive(
    businessId: string,
    id: string,
    isActive: boolean,
    actorUserId?: string,
  ): Promise<Branch> {
    await this.getOwnedBranchOrFail(businessId, id);
    const row = await this.branchesRepository.setActive(
      id,
      businessId,
      isActive,
    );
    if (!row) {
      throw new EntityNotFoundException('Branch', id);
    }
    await this.auditService.record({
      businessId,
      branchId: id,
      userId: actorUserId,
      entityType: 'branch',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    });
    return BranchMapper.toDomain(row);
  }

  private async getOwnedBranchOrFail(
    businessId: string,
    id: string,
  ): Promise<BranchRow> {
    const row = await this.branchesRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Branch', id);
    }
    return row;
  }
}
