import { DbClient } from '../../../database/types/database.types';
import { BranchRow } from '../domain/branch.interface';
import {
  BranchQuery,
  CreateBranchData,
  UpdateBranchData,
} from '../domain/branch.types';

export interface IBranchesRepository {
  create(data: CreateBranchData, client?: DbClient): Promise<BranchRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<BranchRow | null>;
  findAll(query: BranchQuery): Promise<{ rows: BranchRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateBranchData,
    client?: DbClient,
  ): Promise<BranchRow | null>;
  setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<BranchRow | null>;
  existsByName(
    businessId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;
}

export const BRANCHES_REPOSITORY = Symbol('BRANCHES_REPOSITORY');
