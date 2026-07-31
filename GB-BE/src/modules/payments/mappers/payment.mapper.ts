import { Payment, PaymentRow } from '../domain/payment.interface';

export class PaymentMapper {
  static toDomain(row: PaymentRow): Payment {
    return {
      id: row.id,
      orderId: row.order_id,
      paymentMethod: row.payment_method,
      amount: parseFloat(row.amount),
      reference: row.reference,
      status: row.status,
      paidAt: row.paid_at,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}
