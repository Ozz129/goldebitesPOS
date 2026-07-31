export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'NEQUI' | 'DAVIPLATA' | 'OTHER';

export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  reference: string | null;
  status: string;
  paidAt: string;
  createdBy: string | null;
  createdAt: string;
}

export interface CreatePaymentPayload {
  paymentMethod: PaymentMethod;
  amount: number;
  reference?: string;
}
