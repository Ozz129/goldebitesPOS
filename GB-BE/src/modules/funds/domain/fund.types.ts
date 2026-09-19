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
 * in/out of a fund. sourceType/sourceId together identify the originating
 * operation and are both mandatory (BR-06/BR-07/AC-09): every movement must
 * trace back to a real source entity, and the same source can never
 * double-apply to the same fund — reusing it with a different amount or
 * direction is rejected as a conflict rather than silently accepted.
 * Initialization is the one exception, since it has its own one-time-only
 * guard on `funds.initialized_at` instead of this mechanism.
 * actorUserId is mandatory too (BR-07) — every movement must preserve who
 * caused it, same as InitializeFundData already requires.
 */
export interface ApplyFundMovementData {
  businessId: string;
  branchId?: string;
  fundType: FundType;
  amount: number;
  sourceType: string;
  sourceId: string;
  notes?: string;
  actorUserId: string;
}

export interface InitializeFundData {
  businessId: string;
  branchId?: string;
  amount: number;
  notes: string;
  actorUserId: string;
}
