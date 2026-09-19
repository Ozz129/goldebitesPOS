import { FundMovementDirection, FundType } from './fund.types';

export interface Fund {
  id: string;
  businessId: string;
  branchId: string | null;
  fundType: FundType;
  initializedAt: Date | null;
  initializedBy: string | null;
  initializationNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FundRow {
  id: string;
  business_id: string;
  branch_id: string | null;
  fund_type: FundType;
  initialized_at: Date | null;
  initialized_by: string | null;
  initialization_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface FundMovement {
  id: string;
  fundId: string;
  direction: FundMovementDirection;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  sourceType: string;
  sourceId: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface FundMovementRow {
  id: string;
  fund_id: string;
  direction: FundMovementDirection;
  amount: string;
  balance_before: string;
  balance_after: string;
  source_type: string;
  source_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: Date;
}

export interface FundBalance {
  fundType: FundType;
  businessId: string;
  branchId: string | null;
  balance: number;
  initializedAt: Date | null;
}
