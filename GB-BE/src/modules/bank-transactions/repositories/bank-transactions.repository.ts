import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { BankTransactionRow, NormalizedBankTransaction } from '../domain/bank-transaction.types';
import { IBankTransactionsRepository } from './bank-transactions.repository.interface';

const SELECT_COLUMNS = `id, source, external_id, amount, received_at, reference, status, matched_order_id, raw_metadata, created_at, updated_at`;

@Injectable()
export class BankTransactionsRepository implements IBankTransactionsRepository {
  constructor(private readonly db: DatabaseService) {}

  async insertIfNew(
    transaction: NormalizedBankTransaction,
    client?: DbClient,
  ): Promise<BankTransactionRow | null> {
    const result = await this.db.query<BankTransactionRow>(
      `INSERT INTO bank_transactions (source, external_id, amount, received_at, reference, raw_metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (source, external_id) DO NOTHING
       RETURNING ${SELECT_COLUMNS}`,
      [
        transaction.source,
        transaction.externalId,
        transaction.amount,
        transaction.receivedAt,
        transaction.reference,
        JSON.stringify(transaction.rawMetadata),
      ],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findById(id: string, client?: DbClient): Promise<BankTransactionRow | null> {
    const result = await this.db.query<BankTransactionRow>(
      `SELECT ${SELECT_COLUMNS} FROM bank_transactions WHERE id = $1`,
      [id],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findCandidatesByAmountWindow(
    amount: number,
    windowStart: Date,
    windowEnd: Date,
    client?: DbClient,
  ): Promise<BankTransactionRow[]> {
    const result = await this.db.query<BankTransactionRow>(
      `SELECT ${SELECT_COLUMNS} FROM bank_transactions
       WHERE amount = $1
         AND received_at BETWEEN $2 AND $3
         AND status IN ('PENDING', 'REVIEW_REQUIRED')
       ORDER BY received_at`,
      [amount, windowStart, windowEnd],
      client,
    );
    return result.rows;
  }

  async claimForOrder(
    id: string,
    orderId: string,
    client?: DbClient,
  ): Promise<BankTransactionRow | null> {
    const result = await this.db.query<BankTransactionRow>(
      `UPDATE bank_transactions
       SET status = 'MATCHED', matched_order_id = $2, updated_at = now()
       WHERE id = $1 AND status IN ('PENDING', 'REVIEW_REQUIRED')
       RETURNING ${SELECT_COLUMNS}`,
      [id, orderId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async markReviewRequired(id: string, client?: DbClient): Promise<BankTransactionRow | null> {
    const result = await this.db.query<BankTransactionRow>(
      `UPDATE bank_transactions
       SET status = 'REVIEW_REQUIRED', updated_at = now()
       WHERE id = $1 AND status = 'PENDING'
       RETURNING ${SELECT_COLUMNS}`,
      [id],
      client,
    );
    return result.rows[0] ?? null;
  }

  async release(
    id: string,
    revertToStatus: 'PENDING' | 'REVIEW_REQUIRED',
    client?: DbClient,
  ): Promise<void> {
    await this.db.query(
      `UPDATE bank_transactions
       SET status = $2, matched_order_id = NULL, updated_at = now()
       WHERE id = $1`,
      [id, revertToStatus],
      client,
    );
  }
}
