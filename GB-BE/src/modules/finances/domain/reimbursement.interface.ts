import { ReimbursementObligationStatus } from './reimbursement.types';

export interface ReimbursementObligation {
  id: string;
  businessId: string;
  expenseId: string;
  payerEmployeeId: string | null;
  payerName: string;
  originalAmount: number;
  /** Always computed as SUM(reimbursement_payments.amount) — never a stored column. */
  reimbursedAmount: number;
  pendingAmount: number;
  status: ReimbursementObligationStatus;
  voidedAt: Date | null;
  voidedBy: string | null;
  voidReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReimbursementObligationRow {
  id: string;
  business_id: string;
  expense_id: string;
  payer_employee_id: string | null;
  payer_name: string;
  original_amount: string;
  reimbursed_amount: string;
  status: ReimbursementObligationStatus;
  voided_at: Date | null;
  voided_by: string | null;
  void_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ReimbursementPayment {
  id: string;
  obligationId: string;
  branchId: string;
  cashMovementId: string | null;
  amount: number;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface ReimbursementPaymentRow {
  id: string;
  obligation_id: string;
  branch_id: string;
  cash_movement_id: string | null;
  amount: string;
  notes: string | null;
  created_by: string | null;
  created_at: Date;
}
