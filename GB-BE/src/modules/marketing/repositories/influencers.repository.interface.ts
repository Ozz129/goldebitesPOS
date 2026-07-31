import { DbClient } from '../../../database/types/database.types';
import { InfluencerRow } from '../domain/marketing.interface';
import {
  CreateInfluencerData,
  InfluencerQuery,
  UpdateInfluencerData,
} from '../domain/marketing.types';

export interface IInfluencersRepository {
  create(data: CreateInfluencerData, client?: DbClient): Promise<InfluencerRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<InfluencerRow | null>;
  findAll(
    query: InfluencerQuery,
  ): Promise<{ rows: InfluencerRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateInfluencerData,
  ): Promise<InfluencerRow | null>;
  softDelete(id: string, businessId: string): Promise<InfluencerRow | null>;
}

export const INFLUENCERS_REPOSITORY = Symbol('INFLUENCERS_REPOSITORY');
