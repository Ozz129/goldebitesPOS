export enum ReimbursementObligationStatus {
  PENDING = 'PENDING',
  PARTIALLY_REIMBURSED = 'PARTIALLY_REIMBURSED',
  REIMBURSED = 'REIMBURSED',
  VOIDED = 'VOIDED',
}

export interface CreateReimbursementObligationData {
  businessId: string;
  expenseId: string;
  payerEmployeeId?: string;
  payerName: string;
  originalAmount: number;
}

export interface ReimbursementObligationQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: ReimbursementObligationStatus;
  payerEmployeeId?: string;
}

export interface CreateReimbursementPaymentData {
  obligationId: string;
  branchId: string;
  cashMovementId?: string;
  amount: number;
  notes?: string;
  createdBy?: string;
}

export interface ReimbursementObligationSummary {
  pendingCount: number;
  pendingTotalAmount: number;
}
