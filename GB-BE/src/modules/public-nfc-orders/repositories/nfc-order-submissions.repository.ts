import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { NfcOrderSubmissionRow } from '../domain/nfc-order-submission.interface';
import { INfcOrderSubmissionsRepository } from './nfc-order-submissions.repository.interface';

@Injectable()
export class NfcOrderSubmissionsRepository
  implements INfcOrderSubmissionsRepository
{
  constructor(private readonly db: DatabaseService) {}

  async claim(idempotencyKey: string): Promise<boolean> {
    // A concurrent INSERT of the same key blocks on Postgres's unique index
    // until this transaction resolves, then re-evaluates the conflict — the
    // standard, lock-free way to serialize a claim across requests.
    const result = await this.db.query<{ idempotency_key: string }>(
      `INSERT INTO nfc_order_submissions (idempotency_key) VALUES ($1)
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING idempotency_key`,
      [idempotencyKey],
    );
    return result.rows.length > 0;
  }

  async findByKey(
    idempotencyKey: string,
  ): Promise<NfcOrderSubmissionRow | null> {
    const result = await this.db.query<NfcOrderSubmissionRow>(
      `SELECT idempotency_key, order_id, created_at FROM nfc_order_submissions WHERE idempotency_key = $1`,
      [idempotencyKey],
    );
    return result.rows[0] ?? null;
  }

  async linkOrder(idempotencyKey: string, orderId: string): Promise<void> {
    await this.db.query(
      `UPDATE nfc_order_submissions SET order_id = $2 WHERE idempotency_key = $1`,
      [idempotencyKey, orderId],
    );
  }

  async deleteUnresolvedClaim(idempotencyKey: string): Promise<void> {
    await this.db.query(
      `DELETE FROM nfc_order_submissions WHERE idempotency_key = $1 AND order_id IS NULL`,
      [idempotencyKey],
    );
  }
}
