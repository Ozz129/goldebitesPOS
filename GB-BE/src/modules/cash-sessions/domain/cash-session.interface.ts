export enum CashSessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum CashMovementType {
  OPENING = 'OPENING',
  SALE = 'SALE',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  WITHDRAWAL = 'WITHDRAWAL',
  CLOSING = 'CLOSING',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  NEQUI = 'NEQUI',
  DAVIPLATA = 'DAVIPLATA',
  OTHER = 'OTHER',
}

export interface CashSession {
  id: string;
  businessId: string;
  branchId: string;
  openedBy: string;
  closedBy: string | null;
  openingAmount: number;
  expectedClosingAmount: number | null;
  actualClosingAmount: number | null;
  differenceAmount: number | null;
  status: CashSessionStatus;
  openedAt: Date;
  closedAt: Date | null;
  notes: string | null;
}

export interface CashSessionRow {
  id: string;
  business_id: string;
  branch_id: string;
  opened_by: string;
  closed_by: string | null;
  opening_amount: string;
  expected_closing_amount: string | null;
  actual_closing_amount: string | null;
  difference_amount: string | null;
  status: CashSessionStatus;
  opened_at: Date;
  closed_at: Date | null;
  notes: string | null;
}

export interface CashMovement {
  id: string;
  cashSessionId: string;
  orderId: string | null;
  movementType: CashMovementType;
  paymentMethod: PaymentMethod | null;
  amount: number;
  description: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface CashMovementRow {
  id: string;
  cash_session_id: string;
  order_id: string | null;
  movement_type: CashMovementType;
  payment_method: PaymentMethod | null;
  amount: string;
  description: string | null;
  created_by: string | null;
  created_at: Date;
}

export interface CashSessionWithMovements extends CashSession {
  movements: CashMovement[];
}
