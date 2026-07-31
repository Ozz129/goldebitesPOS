import { LoyaltyMovementType } from './loyalty.types';

export interface LoyaltyReward {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  pointsCost: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyRewardRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  points_cost: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
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
  createdAt: Date;
}

export interface LoyaltyMovementRow {
  id: string;
  business_id: string;
  customer_id: string;
  reward_id: string | null;
  type: LoyaltyMovementType;
  points: number;
  description: string;
  created_by: string | null;
  created_at: Date;
}

export interface LoyaltyConfig {
  pointsPerThousand: number;
  birthdayBonusEnabled: boolean;
  birthdayBonusPoints: number;
}
