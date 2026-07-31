import { DbClient } from '../../../database/types/database.types';
import { PaymentRow } from '../domain/payment.interface';
import { CreatePaymentData } from '../domain/payment.types';

export interface IPaymentsRepository {
  create(
    data: CreatePaymentData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<PaymentRow>;
  findByOrder(orderId: string, client?: DbClient): Promise<PaymentRow[]>;
  getTotalPaid(orderId: string, client?: DbClient): Promise<number>;
}

export const PAYMENTS_REPOSITORY = Symbol('PAYMENTS_REPOSITORY');
