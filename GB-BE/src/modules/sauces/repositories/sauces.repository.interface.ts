import { DbClient } from '../../../database/types/database.types';
import { SauceRow } from '../domain/sauce.interface';
import {
  CreateSauceData,
  SauceQuery,
  UpdateSauceData,
} from '../domain/sauce.types';

export interface ISaucesRepository {
  create(data: CreateSauceData, client?: DbClient): Promise<SauceRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<SauceRow | null>;
  findByIds(businessId: string, ids: string[]): Promise<SauceRow[]>;
  findAll(query: SauceQuery): Promise<{ rows: SauceRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateSauceData,
    client?: DbClient,
  ): Promise<SauceRow | null>;
  setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<SauceRow | null>;
  existsByName(
    businessId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;
}

export const SAUCES_REPOSITORY = Symbol('SAUCES_REPOSITORY');
