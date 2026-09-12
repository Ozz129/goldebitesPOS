import { DbClient } from '../../../database/types/database.types';
import { BankTransferRequestRow, CreateBankTransferRequestData } from '../domain/bank-transaction.types';

export interface IBankTransferRequestsRepository {
  create(
    data: CreateBankTransferRequestData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<BankTransferRequestRow>;
  findById(id: string, client?: DbClient): Promise<BankTransferRequestRow | null>;
  findActiveByOrder(orderId: string, client?: DbClient): Promise<BankTransferRequestRow | null>;
  /** Most recent request for an order regardless of status — used to report MATCHED/CANCELLED after the fact. */
  findLatestByOrder(orderId: string, client?: DbClient): Promise<BankTransferRequestRow | null>;
  findWaitingForBusiness(businessId: string, client?: DbClient): Promise<BankTransferRequestRow[]>;
  /** Claims a WAITING request as resolved by a transaction. Returns null if it was no longer WAITING (race lost). */
  claim(
    id: string,
    matchedTransactionId: string,
    confirmedBy: string | undefined,
    client?: DbClient,
  ): Promise<BankTransferRequestRow | null>;
  cancel(id: string, client?: DbClient): Promise<BankTransferRequestRow | null>;
  /** Compensating action: reverts a claim back to WAITING if payment creation failed afterwards. */
  release(id: string, client?: DbClient): Promise<void>;
}

export const BANK_TRANSFER_REQUESTS_REPOSITORY = Symbol('BANK_TRANSFER_REQUESTS_REPOSITORY');
