import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';

export interface CreatePaymentData {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  reference?: string;
}
