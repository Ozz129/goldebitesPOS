export type LoyaltyMovementType = 'EARNED' | 'REDEEMED' | 'ADJUSTED';

export interface LoyaltyConfig {
  pointsPerThousand: number;
  birthdayBonusEnabled: boolean;
  birthdayBonusPoints: number;
}

export interface LoyaltyReward {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  pointsCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyMovement {
  id: string;
  businessId: string;
  customerId: string;
  rewardId: string | null;
  type: LoyaltyMovementType;
  points: number;
  description: string;
  createdBy: string | null;
  createdAt: string;
}

export interface UpdateLoyaltyConfigPayload {
  pointsPerThousand?: number;
  birthdayBonusEnabled?: boolean;
  birthdayBonusPoints?: number;
}

export interface CreateRewardPayload {
  name: string;
  description?: string;
  pointsCost: number;
}

export type UpdateRewardPayload = Partial<CreateRewardPayload>;

export interface RewardFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface MovementFilters {
  page?: number;
  limit?: number;
  customerId?: string;
  type?: LoyaltyMovementType;
}

export interface RedeemRewardPayload {
  customerId: string;
  rewardId: string;
}
