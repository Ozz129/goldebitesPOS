import { NormalizedBankTransaction } from '../domain/bank-transaction.types';

/**
 * Port for anything that can report bank movements. The initial implementation reads
 * Bancolombia's email notifications; a real bank API, Wompi, or Nequi could implement
 * this same contract later without touching ingestion/matching/order logic at all.
 */
export interface BankTransactionProvider {
  /** Returns transactions received strictly after `since`, normalized and ready to persist. */
  fetchNewTransactions(since: Date): Promise<NormalizedBankTransaction[]>;
}

export const BANK_TRANSACTION_PROVIDER = Symbol('BANK_TRANSACTION_PROVIDER');
