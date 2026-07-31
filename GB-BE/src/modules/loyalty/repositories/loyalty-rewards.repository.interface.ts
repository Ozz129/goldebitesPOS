import { DbClient } from '../../../database/types/database.types';
import { LoyaltyRewardRow } from '../domain/loyalty.interface';
import {
  CreateLoyaltyRewardData,
  LoyaltyRewardQuery,
  UpdateLoyaltyRewardData,
} from '../domain/loyalty.types';

export interface ILoyaltyRewardsRepository {
  create(
    data: CreateLoyaltyRewardData,
    client?: DbClient,
  ): Promise<LoyaltyRewardRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<LoyaltyRewardRow | null>;
  findAll(
    query: LoyaltyRewardQuery,
  ): Promise<{ rows: LoyaltyRewardRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateLoyaltyRewardData,
  ): Promise<LoyaltyRewardRow | null>;
  setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<LoyaltyRewardRow | null>;
  softDelete(id: string, businessId: string): Promise<LoyaltyRewardRow | null>;
}

export const LOYALTY_REWARDS_REPOSITORY = Symbol('LOYALTY_REWARDS_REPOSITORY');
