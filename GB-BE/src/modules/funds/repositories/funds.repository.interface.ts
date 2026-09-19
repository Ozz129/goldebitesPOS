import { DbClient } from '../../../database/types/database.types';
import { FundMovementRow, FundRow } from '../domain/fund.interface';
import { FundMovementDirection, FundType } from '../domain/fund.types';

export interface InsertFundMovementData {
  fundId: string;
  direction: FundMovementDirection;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  sourceType: string;
  sourceId?: string;
  notes?: string;
  createdBy?: string;
}

export interface IFundsRepository {
  /** Creates the fund row if it doesn't exist yet, then locks it (SELECT ... FOR UPDATE) so concurrent writers serialize. Must run inside a transaction. */
  getOrCreateFundForUpdate(
    businessId: string,
    branchId: string | null,
    fundType: FundType,
    client: DbClient,
  ): Promise<FundRow>;
  findFund(
    businessId: string,
    branchId: string | null,
    fundType: FundType,
  ): Promise<FundRow | null>;
  markInitialized(
    fundId: string,
    initializedBy: string,
    notes: string,
    client: DbClient,
  ): Promise<void>;
  findLatestMovement(
    fundId: string,
    client?: DbClient,
  ): Promise<FundMovementRow | null>;
  findMovementBySource(
    fundId: string,
    sourceType: string,
    sourceId: string,
    client: DbClient,
  ): Promise<FundMovementRow | null>;
  insertMovement(
    data: InsertFundMovementData,
    client: DbClient,
  ): Promise<FundMovementRow>;
}

export const FUNDS_REPOSITORY = Symbol('FUNDS_REPOSITORY');
