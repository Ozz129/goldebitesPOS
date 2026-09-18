import {
  ReimbursementObligation,
  ReimbursementObligationRow,
  ReimbursementPayment,
  ReimbursementPaymentRow,
} from '../domain/reimbursement.interface';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export class ReimbursementObligationMapper {
  static toDomain(row: ReimbursementObligationRow): ReimbursementObligation {
    const originalAmount = parseFloat(row.original_amount);
    const reimbursedAmount = parseFloat(row.reimbursed_amount);
    return {
      id: row.id,
      businessId: row.business_id,
      expenseId: row.expense_id,
      payerEmployeeId: row.payer_employee_id,
      payerName: row.payer_name,
      originalAmount,
      reimbursedAmount,
      pendingAmount: round2(originalAmount - reimbursedAmount),
      status: row.status,
      voidedAt: row.voided_at,
      voidedBy: row.voided_by,
      voidReason: row.void_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export class ReimbursementPaymentMapper {
  static toDomain(row: ReimbursementPaymentRow): ReimbursementPayment {
    return {
      id: row.id,
      obligationId: row.obligation_id,
      branchId: row.branch_id,
      cashMovementId: row.cash_movement_id,
      amount: parseFloat(row.amount),
      notes: row.notes,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}
