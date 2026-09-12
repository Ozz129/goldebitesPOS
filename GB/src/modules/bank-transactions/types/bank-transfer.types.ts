export interface BankTransferRequest {
  id: string;
  businessId: string;
  orderId: string;
  amountExpected: number;
  status: 'WAITING' | 'MATCHED' | 'CANCELLED' | 'EXPIRED';
  matchedTransactionId: string | null;
  confirmedBy: string | null;
  createdBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ReviewCandidate {
  transactionId: string;
  amount: number;
  receivedAt: string;
  reference: string | null;
}

export type BankTransferStatusView =
  | { state: 'NONE' }
  | { state: 'WAITING'; request: BankTransferRequest; reviewCandidates: ReviewCandidate[] }
  | { state: 'MATCHED'; request: BankTransferRequest };
