import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';
import { PaymentRow } from '../domain/payment.interface';
import { CreatePaymentData } from '../domain/payment.types';
import { IPaymentsRepository } from './payments.repository.interface';

const SELECT_COLUMNS = `id, order_id, payment_method, amount, reference, payer_label, status, paid_at, created_by, created_at`;

interface TotalRow {
  total: string | null;
}

@Injectable()
export class PaymentsRepository implements IPaymentsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreatePaymentData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<PaymentRow> {
    const result = await this.db.query<PaymentRow>(
      `INSERT INTO payments (order_id, payment_method, amount, reference, payer_label, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.orderId,
        data.paymentMethod,
        data.amount,
        data.reference ?? null,
        data.payerLabel ?? null,
        createdBy ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(id: string, client?: DbClient): Promise<PaymentRow | null> {
    const result = await this.db.query<PaymentRow>(
      `SELECT ${SELECT_COLUMNS} FROM payments WHERE id = $1`,
      [id],
      client,
    );
    return result.rows[0] ?? null;
  }

  async updateMethod(
    id: string,
    paymentMethod: PaymentMethod,
    reference: string | undefined,
    client?: DbClient,
  ): Promise<PaymentRow | null> {
    const result = await this.db.query<PaymentRow>(
      `UPDATE payments
       SET payment_method = $2, reference = COALESCE($3, reference)
       WHERE id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [id, paymentMethod, reference ?? null],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findByOrder(orderId: string, client?: DbClient): Promise<PaymentRow[]> {
    const result = await this.db.query<PaymentRow>(
      `SELECT ${SELECT_COLUMNS} FROM payments WHERE order_id = $1 ORDER BY created_at`,
      [orderId],
      client,
    );
    return result.rows;
  }

  async getTotalPaid(orderId: string, client?: DbClient): Promise<number> {
    const result = await this.db.query<TotalRow>(
      `SELECT SUM(amount)::text AS total FROM payments WHERE order_id = $1`,
      [orderId],
      client,
    );
    return parseFloat(result.rows[0]?.total ?? '0');
  }
}
