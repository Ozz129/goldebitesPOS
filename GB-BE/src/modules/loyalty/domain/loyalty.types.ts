export enum LoyaltyMovementType {
  EARNED = 'EARNED',
  REDEEMED = 'REDEEMED',
  ADJUSTED = 'ADJUSTED',
}

export interface CreateLoyaltyRewardData {
  businessId: string;
  name: string;
  description?: string;
  pointsCost: number;
}

export interface UpdateLoyaltyRewardData {
  name?: string;
  description?: string;
  pointsCost?: number;
}

export interface LoyaltyRewardQuery {
  businessId: string;
  page: number;
  limit: number;
  isActive?: boolean;
}

export interface UpdateLoyaltyConfigData {
  pointsPerThousand?: number;
  birthdayBonusEnabled?: boolean;
  birthdayBonusPoints?: number;
}

export interface LoyaltyMovementQuery {
  businessId: string;
  page: number;
  limit: number;
  customerId?: string;
  type?: LoyaltyMovementType;
}
