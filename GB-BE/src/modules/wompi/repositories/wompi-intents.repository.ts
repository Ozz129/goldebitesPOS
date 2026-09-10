import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { CreateWompiIntentData, WompiIntentRow, WompiIntentStatus } from '../domain/wompi.types';
import { IWompiIntentsRepository } from './wompi-intents.repository.interface';

const SELECT_COLUMNS = `id, business_id, order_id, reference, amount_in_cents, payer_label, status,
  wompi_transaction_id, payment_id, created_by, created_at, updated_at`;

@Injectable()
export class WompiIntentsRepository implements IWompiIntentsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateWompiIntentData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<WompiIntentRow> {
    const result = await this.db.query<WompiIntentRow>(
      `INSERT INTO wompi_payment_intents (business_id, order_id, reference, amount_in_cents, payer_label, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.orderId,
        data.reference,
        data.amountInCents,
        data.payerLabel ?? null,
        createdBy ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findByReference(reference: string, client?: DbClient): Promise<WompiIntentRow | null> {
    const result = await this.db.query<WompiIntentRow>(
      `SELECT ${SELECT_COLUMNS} FROM wompi_payment_intents WHERE reference = $1`,
      [reference],
      client,
    );
    return result.rows[0] ?? null;
  }

  async markResolved(
    id: string,
    status: WompiIntentStatus,
    wompiTransactionId: string,
    paymentId: string | null,
    client?: DbClient,
  ): Promise<WompiIntentRow | null> {
    const result = await this.db.query<WompiIntentRow>(
      `UPDATE wompi_payment_intents
       SET status = $2, wompi_transaction_id = $3, payment_id = $4, updated_at = now()
       WHERE id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [id, status, wompiTransactionId, paymentId],
      client,
    );
    return result.rows[0] ?? null;
  }
}
