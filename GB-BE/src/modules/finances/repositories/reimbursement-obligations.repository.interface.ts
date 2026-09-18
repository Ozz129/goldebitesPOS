import { DbClient } from '../../../database/types/database.types';
import { ReimbursementObligationRow } from '../domain/reimbursement.interface';
import {
  CreateReimbursementObligationData,
  ReimbursementObligationQuery,
  ReimbursementObligationStatus,
  ReimbursementObligationSummary,
} from '../domain/reimbursement.types';

export interface IReimbursementObligationsRepository {
  create(
    data: CreateReimbursementObligationData,
    client?: DbClient,
  ): Promise<ReimbursementObligationRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ReimbursementObligationRow | null>;
  findAll(
    query: ReimbursementObligationQuery,
  ): Promise<{ rows: ReimbursementObligationRow[]; total: number }>;
  updateStatus(
    id: string,
    status: ReimbursementObligationStatus,
    client?: DbClient,
  ): Promise<void>;
  void(
    id: string,
    voidedBy: string,
    reason: string,
  ): Promise<ReimbursementObligationRow | null>;
  getSummary(businessId: string): Promise<ReimbursementObligationSummary>;
}

export const REIMBURSEMENT_OBLIGATIONS_REPOSITORY = Symbol(
  'REIMBURSEMENT_OBLIGATIONS_REPOSITORY',
);
