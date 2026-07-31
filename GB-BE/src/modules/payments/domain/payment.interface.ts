import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';

export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  reference: string | null;
  status: string;
  paidAt: Date;
  createdBy: string | null;
  createdAt: Date;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: string;
  reference: string | null;
  status: string;
  paid_at: Date;
  created_by: string | null;
  created_at: Date;
}
