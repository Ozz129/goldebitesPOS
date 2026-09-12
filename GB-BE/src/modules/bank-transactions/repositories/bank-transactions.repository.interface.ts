import { DbClient } from '../../../database/types/database.types';
import { BankTransactionRow, NormalizedBankTransaction } from '../domain/bank-transaction.types';

export interface IBankTransactionsRepository {
  /** Insert-if-new by (source, external_id) — returns null when it already existed (idempotent ingestion). */
  insertIfNew(
    transaction: NormalizedBankTransaction,
    client?: DbClient,
  ): Promise<BankTransactionRow | null>;
  findById(id: string, client?: DbClient): Promise<BankTransactionRow | null>;
  /** PENDING/REVIEW_REQUIRED transactions matching an exact amount within a received_at window. */
  findCandidatesByAmountWindow(
    amount: number,
    windowStart: Date,
    windowEnd: Date,
    client?: DbClient,
  ): Promise<BankTransactionRow[]>;
  /** Claims a transaction for one order. Returns null if it was no longer PENDING/REVIEW_REQUIRED (race lost). */
  claimForOrder(
    id: string,
    orderId: string,
    client?: DbClient,
  ): Promise<BankTransactionRow | null>;
  markReviewRequired(id: string, client?: DbClient): Promise<BankTransactionRow | null>;
  /** Compensating action: reverts a claim if payment creation failed afterwards, so the transaction can be retried. */
  release(id: string, revertToStatus: 'PENDING' | 'REVIEW_REQUIRED', client?: DbClient): Promise<void>;
}

export const BANK_TRANSACTIONS_REPOSITORY = Symbol('BANK_TRANSACTIONS_REPOSITORY');
