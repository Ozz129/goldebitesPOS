export enum FundType {
  CASH_RESERVE = 'CASH_RESERVE',
  NEXT_OPENING_FUND = 'NEXT_OPENING_FUND',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
}

export enum FundMovementDirection {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

/**
 * The reusable primitive other tickets (GOL-5/6/7/9) call to move money
 * in/out of a fund. sourceType/sourceId identify the originating operation —
 * required together for idempotency (the same source can never double-apply
 * to the same fund). Omit sourceId only for operations with no natural
 * origin entity (there are none today; initialization uses its own
 * one-time-only guard on `funds.initialized_at` instead of this mechanism).
 */
export interface ApplyFundMovementData {
  businessId: string;
  branchId?: string;
  fundType: FundType;
  amount: number;
  sourceType: string;
  sourceId?: string;
  notes?: string;
  actorUserId?: string;
}

export interface InitializeFundData {
  businessId: string;
  branchId?: string;
  amount: number;
  notes: string;
  actorUserId: string;
}
