import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';

export interface CreatePaymentData {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  reference?: string;
  payerLabel?: string;
}

export interface UpdatePaymentMethodData {
  paymentMethod: PaymentMethod;
  reference?: string;
}
