import {
  CashMovementType,
  CashSessionStatus,
  PaymentMethod,
} from './cash-session.interface';

export interface OpenCashSessionData {
  businessId: string;
  branchId: string;
  openingAmount: number;
  notes?: string;
}

export interface CloseCashSessionData {
  actualClosingAmount: number;
  actualTransferAmount?: number;
  notes?: string;
}

export interface RecordCashMovementData {
  cashSessionId: string;
  orderId?: string;
  paymentId?: string;
  movementType: CashMovementType;
  paymentMethod?: PaymentMethod;
  amount: number;
  description?: string;
  createdBy?: string;
}

export interface CashSessionQuery {
  businessId: string;
  page: number;
  limit: number;
  branchId?: string;
  status?: CashSessionStatus;
}
