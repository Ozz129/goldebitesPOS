import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { BusinessesService } from '../../businesses/services/businesses.service';
import { CustomersService } from '../../customers/services/customers.service';
import { LoyaltyConfig, LoyaltyMovement } from '../domain/loyalty.interface';
import {
  LoyaltyMovementQuery,
  LoyaltyMovementType,
  UpdateLoyaltyConfigData,
} from '../domain/loyalty.types';
import { LoyaltyMapper } from '../mappers/loyalty.mapper';
import { LOYALTY_MOVEMENTS_REPOSITORY } from '../repositories/loyalty-movements.repository.interface';
import type { ILoyaltyMovementsRepository } from '../repositories/loyalty-movements.repository.interface';
import { LoyaltyRewardsService } from './loyalty-rewards.service';

@Injectable()
export class LoyaltyService {
  constructor(
    @Inject(LOYALTY_MOVEMENTS_REPOSITORY)
    private readonly movementsRepository: ILoyaltyMovementsRepository,
    private readonly businessesService: BusinessesService,
    private readonly customersService: CustomersService,
    private readonly rewardsService: LoyaltyRewardsService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async getConfig(businessId: string): Promise<LoyaltyConfig> {
    return this.businessesService.getLoyaltyConfig(businessId);
  }

  async updateConfig(
    businessId: string,
    data: UpdateLoyaltyConfigData,
    actorUserId?: string,
  ): Promise<LoyaltyConfig> {
    await this.businessesService.updateLoyaltyConfig(
      businessId,
      data,
      actorUserId,
    );
    return this.businessesService.getLoyaltyConfig(businessId);
  }

  async findMovements(
    query: LoyaltyMovementQuery,
  ): Promise<PaginatedResult<LoyaltyMovement>> {
    const { rows, total } = await this.movementsRepository.findAll(query);
    return {
      data: rows.map((row) => LoyaltyMapper.movementToDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async redeem(
    businessId: string,
    customerId: string,
    rewardId: string,
    actorUserId?: string,
  ): Promise<LoyaltyMovement> {
    const reward = await this.rewardsService.getOwnedOrFail(
      businessId,
      rewardId,
    );
    if (!reward.isActive) {
      throw new BusinessRuleException(
        'This reward is not active',
        'LOYALTY_REWARD_INACTIVE',
      );
    }

    const customer = await this.customersService.getOwnedOrFail(
      businessId,
      customerId,
    );
    if (customer.loyalty_points < reward.pointsCost) {
      throw new BusinessRuleException(
        'Customer does not have enough loyalty points',
        'LOYALTY_POINTS_INSUFFICIENT',
      );
    }

    const movementRow = await this.transactionService.execute(
      async (client) => {
        await this.customersService.adjustLoyaltyPoints(
          businessId,
          customerId,
          -reward.pointsCost,
          client,
        );
        return this.movementsRepository.create(
          {
            businessId,
            customerId,
            rewardId: reward.id,
            type: LoyaltyMovementType.REDEEMED,
            points: reward.pointsCost,
            description: `Canje: ${reward.name}`,
          },
          actorUserId,
          client,
        );
      },
    );

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'loyalty_movement',
      entityId: movementRow.id,
      action: 'REDEEM',
      newValues: { customerId, rewardId, points: reward.pointsCost },
    });

    return LoyaltyMapper.movementToDomain(movementRow);
  }

  /** Used by OrdersService when a DELIVERED order is tied to a customer. */
  async awardPointsForOrder(
    businessId: string,
    customerId: string,
    amountSpent: number,
    client?: DbClient,
  ): Promise<void> {
    const config = await this.businessesService.getLoyaltyConfig(businessId);
    const points = Math.floor((amountSpent / 1000) * config.pointsPerThousand);
    if (points <= 0) {
      return;
    }

    await this.customersService.adjustLoyaltyPoints(
      businessId,
      customerId,
      points,
      client,
    );
    await this.movementsRepository.create(
      {
        businessId,
        customerId,
        type: LoyaltyMovementType.EARNED,
        points,
        description: 'Compra completada',
      },
      undefined,
      client,
    );
  }
}
