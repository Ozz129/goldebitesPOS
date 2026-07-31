import {
  CashMovement,
  CashMovementRow,
  CashSession,
  CashSessionRow,
} from '../domain/cash-session.interface';

export class CashSessionMapper {
  static toDomain(row: CashSessionRow): CashSession {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      openedBy: row.opened_by,
      closedBy: row.closed_by,
      openingAmount: parseFloat(row.opening_amount),
      expectedClosingAmount:
        row.expected_closing_amount === null
          ? null
          : parseFloat(row.expected_closing_amount),
      actualClosingAmount:
        row.actual_closing_amount === null
          ? null
          : parseFloat(row.actual_closing_amount),
      differenceAmount:
        row.difference_amount === null
          ? null
          : parseFloat(row.difference_amount),
      status: row.status,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
      notes: row.notes,
    };
  }

  static movementToDomain(row: CashMovementRow): CashMovement {
    return {
      id: row.id,
      cashSessionId: row.cash_session_id,
      orderId: row.order_id,
      movementType: row.movement_type,
      paymentMethod: row.payment_method,
      amount: parseFloat(row.amount),
      description: row.description,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}
