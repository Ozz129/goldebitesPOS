import { DbClient } from '../../../database/types/database.types';
import { LoyaltyMovementRow } from '../domain/loyalty.interface';
import {
  LoyaltyMovementQuery,
  LoyaltyMovementType,
} from '../domain/loyalty.types';

export interface CreateLoyaltyMovementData {
  businessId: string;
  customerId: string;
  rewardId?: string;
  type: LoyaltyMovementType;
  points: number;
  description: string;
}

export interface ILoyaltyMovementsRepository {
  create(
    data: CreateLoyaltyMovementData,
    actorUserId: string | undefined,
    client?: DbClient,
  ): Promise<LoyaltyMovementRow>;
  findAll(
    query: LoyaltyMovementQuery,
  ): Promise<{ rows: LoyaltyMovementRow[]; total: number }>;
}

export const LOYALTY_MOVEMENTS_REPOSITORY = Symbol(
  'LOYALTY_MOVEMENTS_REPOSITORY',
);
