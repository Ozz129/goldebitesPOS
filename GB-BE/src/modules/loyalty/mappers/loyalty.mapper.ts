import {
  LoyaltyMovement,
  LoyaltyMovementRow,
  LoyaltyReward,
  LoyaltyRewardRow,
} from '../domain/loyalty.interface';

export class LoyaltyMapper {
  static rewardToDomain(row: LoyaltyRewardRow): LoyaltyReward {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      description: row.description,
      pointsCost: row.points_cost,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static movementToDomain(row: LoyaltyMovementRow): LoyaltyMovement {
    return {
      id: row.id,
      businessId: row.business_id,
      customerId: row.customer_id,
      rewardId: row.reward_id,
      type: row.type,
      points: row.points,
      description: row.description,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}
