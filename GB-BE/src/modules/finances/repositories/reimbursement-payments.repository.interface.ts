import { DbClient } from '../../../database/types/database.types';
import { ReimbursementPaymentRow } from '../domain/reimbursement.interface';
import { CreateReimbursementPaymentData } from '../domain/reimbursement.types';

export interface IReimbursementPaymentsRepository {
  create(
    data: CreateReimbursementPaymentData,
    client?: DbClient,
  ): Promise<ReimbursementPaymentRow>;
  findByObligation(
    obligationId: string,
    client?: DbClient,
  ): Promise<ReimbursementPaymentRow[]>;
}

export const REIMBURSEMENT_PAYMENTS_REPOSITORY = Symbol(
  'REIMBURSEMENT_PAYMENTS_REPOSITORY',
);
