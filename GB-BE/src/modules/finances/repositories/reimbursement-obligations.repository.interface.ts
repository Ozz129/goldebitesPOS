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
  /** The active (non-voided) obligation for an expense, if any — at most one can exist at a time (see 061_relax_reimbursement_obligation_expense_uniqueness.sql). */
  findActiveByExpenseId(
    expenseId: string,
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
    client?: DbClient,
  ): Promise<ReimbursementObligationRow | null>;
  getSummary(businessId: string): Promise<ReimbursementObligationSummary>;
}

export const REIMBURSEMENT_OBLIGATIONS_REPOSITORY = Symbol(
  'REIMBURSEMENT_OBLIGATIONS_REPOSITORY',
);
