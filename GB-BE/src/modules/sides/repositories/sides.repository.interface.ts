import { DbClient } from '../../../database/types/database.types';
import { SideRow } from '../domain/side.interface';
import {
  CreateSideData,
  SideQuery,
  UpdateSideData,
} from '../domain/side.types';

export interface ISidesRepository {
  create(data: CreateSideData, client?: DbClient): Promise<SideRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<SideRow | null>;
  findByIds(businessId: string, ids: string[]): Promise<SideRow[]>;
  findAll(query: SideQuery): Promise<{ rows: SideRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateSideData,
    client?: DbClient,
  ): Promise<SideRow | null>;
  setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<SideRow | null>;
  existsByName(
    businessId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;
}

export const SIDES_REPOSITORY = Symbol('SIDES_REPOSITORY');
