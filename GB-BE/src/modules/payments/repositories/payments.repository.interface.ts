import { DbClient } from '../../../database/types/database.types';
import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';
import { PaymentRow } from '../domain/payment.interface';
import { CreatePaymentData } from '../domain/payment.types';

export interface IPaymentsRepository {
  create(
    data: CreatePaymentData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<PaymentRow>;
  findById(id: string, client?: DbClient): Promise<PaymentRow | null>;
  findByOrder(orderId: string, client?: DbClient): Promise<PaymentRow[]>;
  getTotalPaid(orderId: string, client?: DbClient): Promise<number>;
  updateMethod(
    id: string,
    paymentMethod: PaymentMethod,
    reference: string | undefined,
    client?: DbClient,
  ): Promise<PaymentRow | null>;
}

export const PAYMENTS_REPOSITORY = Symbol('PAYMENTS_REPOSITORY');
