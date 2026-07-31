import { DbClient } from '../../../database/types/database.types';
import { CampaignRow } from '../domain/marketing.interface';
import {
  CampaignQuery,
  CreateCampaignData,
  UpdateCampaignData,
} from '../domain/marketing.types';

export interface ICampaignsRepository {
  create(data: CreateCampaignData, client?: DbClient): Promise<CampaignRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<CampaignRow | null>;
  findAll(
    query: CampaignQuery,
  ): Promise<{ rows: CampaignRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateCampaignData,
  ): Promise<CampaignRow | null>;
  softDelete(id: string, businessId: string): Promise<CampaignRow | null>;
}

export const CAMPAIGNS_REPOSITORY = Symbol('CAMPAIGNS_REPOSITORY');
