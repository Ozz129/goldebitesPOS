export enum BankTransactionSource {
  BANCOLOMBIA_EMAIL = 'BANCOLOMBIA_EMAIL',
  MOCK = 'MOCK',
}

export enum BankTransactionStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  IGNORED = 'IGNORED',
}

export enum BankTransferRequestStatus {
  WAITING = 'WAITING',
  MATCHED = 'MATCHED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/** Normalized shape every BankTransactionProvider must return, regardless of the underlying source. */
export interface NormalizedBankTransaction {
  externalId: string;
  amount: number;
  receivedAt: Date;
  reference: string | null;
  source: BankTransactionSource;
  rawMetadata: Record<string, unknown>;
}

export interface BankTransaction {
  id: string;
  source: BankTransactionSource;
  externalId: string;
  amount: number;
  receivedAt: Date;
  reference: string | null;
  status: BankTransactionStatus;
  matchedOrderId: string | null;
  rawMetadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransactionRow {
  id: string;
  source: BankTransactionSource;
  external_id: string;
  amount: string;
  received_at: Date;
  reference: string | null;
  status: BankTransactionStatus;
  matched_order_id: string | null;
  raw_metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface BankTransferRequest {
  id: string;
  businessId: string;
  orderId: string;
  amountExpected: number;
  status: BankTransferRequestStatus;
  matchedTransactionId: string | null;
  confirmedBy: string | null;
  createdBy: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface BankTransferRequestRow {
  id: string;
  business_id: string;
  order_id: string;
  amount_expected: string;
  status: BankTransferRequestStatus;
  matched_transaction_id: string | null;
  confirmed_by: string | null;
  created_by: string | null;
  created_at: Date;
  resolved_at: Date | null;
}

export interface CreateBankTransferRequestData {
  businessId: string;
  orderId: string;
  amountExpected: number;
}

/** A REVIEW_REQUIRED transaction that could plausibly belong to a given order, shown to the cashier. */
export interface ReviewCandidate {
  transactionId: string;
  amount: number;
  receivedAt: Date;
  reference: string | null;
}

export type BankTransferStatusView =
  | { state: 'NONE' }
  | { state: 'WAITING'; request: BankTransferRequest; reviewCandidates: ReviewCandidate[] }
  | { state: 'MATCHED'; request: BankTransferRequest };
