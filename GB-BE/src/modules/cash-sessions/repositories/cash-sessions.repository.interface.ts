import { DbClient } from '../../../database/types/database.types';
import {
  CashMovementRow,
  CashSessionRow,
} from '../domain/cash-session.interface';
import {
  CashSessionQuery,
  OpenCashSessionData,
  RecordCashMovementData,
} from '../domain/cash-session.types';

export interface ICashSessionsRepository {
  create(
    data: OpenCashSessionData,
    openedBy: string,
    client?: DbClient,
  ): Promise<CashSessionRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<CashSessionRow | null>;
  findOpenForBranch(
    businessId: string,
    branchId: string,
    client?: DbClient,
  ): Promise<CashSessionRow | null>;
  findAll(
    query: CashSessionQuery,
  ): Promise<{ rows: CashSessionRow[]; total: number }>;
  addMovement(
    data: RecordCashMovementData,
    client?: DbClient,
  ): Promise<CashMovementRow>;
  findMovements(
    cashSessionId: string,
    client?: DbClient,
  ): Promise<CashMovementRow[]>;
  getExpectedClosingAmount(
    cashSessionId: string,
    client?: DbClient,
  ): Promise<number>;
  close(
    id: string,
    businessId: string,
    closedBy: string | undefined,
    expectedClosingAmount: number,
    actualClosingAmount: number,
    differenceAmount: number,
    notes: string | undefined,
    client?: DbClient,
  ): Promise<CashSessionRow | null>;
}

export const CASH_SESSIONS_REPOSITORY = Symbol('CASH_SESSIONS_REPOSITORY');
