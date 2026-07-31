import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { LoyaltyReward } from '../domain/loyalty.interface';
import {
  CreateLoyaltyRewardData,
  LoyaltyRewardQuery,
  UpdateLoyaltyRewardData,
} from '../domain/loyalty.types';
import { LoyaltyMapper } from '../mappers/loyalty.mapper';
import { LOYALTY_REWARDS_REPOSITORY } from '../repositories/loyalty-rewards.repository.interface';
import type { ILoyaltyRewardsRepository } from '../repositories/loyalty-rewards.repository.interface';

@Injectable()
export class LoyaltyRewardsService {
  constructor(
    @Inject(LOYALTY_REWARDS_REPOSITORY)
    private readonly rewardsRepository: ILoyaltyRewardsRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateLoyaltyRewardData,
    actorUserId?: string,
  ): Promise<LoyaltyReward> {
    const row = await this.rewardsRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'loyalty_reward',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name, pointsCost: row.points_cost },
    });
    return LoyaltyMapper.rewardToDomain(row);
  }

  async findAll(
    query: LoyaltyRewardQuery,
  ): Promise<PaginatedResult<LoyaltyReward>> {
    const { rows, total } = await this.rewardsRepository.findAll(query);
    return {
      data: rows.map((row) => LoyaltyMapper.rewardToDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateLoyaltyRewardData,
    actorUserId?: string,
  ): Promise<LoyaltyReward> {
    const row = await this.rewardsRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('LoyaltyReward', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'loyalty_reward',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return LoyaltyMapper.rewardToDomain(row);
  }

  async setActive(
    businessId: string,
    id: string,
    isActive: boolean,
    actorUserId?: string,
  ): Promise<LoyaltyReward> {
    const row = await this.rewardsRepository.setActive(
      id,
      businessId,
      isActive,
    );
    if (!row) {
      throw new EntityNotFoundException('LoyaltyReward', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'loyalty_reward',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    });
    return LoyaltyMapper.rewardToDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.rewardsRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('LoyaltyReward', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'loyalty_reward',
      entityId: id,
      action: 'DELETE',
    });
  }

  /** Used by LoyaltyService when redeeming a reward. */
  async getOwnedOrFail(businessId: string, id: string): Promise<LoyaltyReward> {
    const row = await this.rewardsRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('LoyaltyReward', id);
    }
    return LoyaltyMapper.rewardToDomain(row);
  }
}
