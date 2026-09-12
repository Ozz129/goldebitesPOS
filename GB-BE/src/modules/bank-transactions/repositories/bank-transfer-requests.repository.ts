import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { BankTransferRequestRow, CreateBankTransferRequestData } from '../domain/bank-transaction.types';
import { IBankTransferRequestsRepository } from './bank-transfer-requests.repository.interface';

const SELECT_COLUMNS = `id, business_id, order_id, amount_expected, status, matched_transaction_id, confirmed_by, created_by, created_at, resolved_at`;

@Injectable()
export class BankTransferRequestsRepository implements IBankTransferRequestsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateBankTransferRequestData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<BankTransferRequestRow> {
    const result = await this.db.query<BankTransferRequestRow>(
      `INSERT INTO bank_transfer_requests (business_id, order_id, amount_expected, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_COLUMNS}`,
      [data.businessId, data.orderId, data.amountExpected, createdBy ?? null],
      client,
    );
    return result.rows[0];
  }

  async findById(id: string, client?: DbClient): Promise<BankTransferRequestRow | null> {
    const result = await this.db.query<BankTransferRequestRow>(
      `SELECT ${SELECT_COLUMNS} FROM bank_transfer_requests WHERE id = $1`,
      [id],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findActiveByOrder(orderId: string, client?: DbClient): Promise<BankTransferRequestRow | null> {
    const result = await this.db.query<BankTransferRequestRow>(
      `SELECT ${SELECT_COLUMNS} FROM bank_transfer_requests WHERE order_id = $1 AND status = 'WAITING'`,
      [orderId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findLatestByOrder(orderId: string, client?: DbClient): Promise<BankTransferRequestRow | null> {
    const result = await this.db.query<BankTransferRequestRow>(
      `SELECT ${SELECT_COLUMNS} FROM bank_transfer_requests
       WHERE order_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [orderId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findWaitingForBusiness(businessId: string, client?: DbClient): Promise<BankTransferRequestRow[]> {
    const result = await this.db.query<BankTransferRequestRow>(
      `SELECT ${SELECT_COLUMNS} FROM bank_transfer_requests
       WHERE business_id = $1 AND status = 'WAITING'
       ORDER BY created_at`,
      [businessId],
      client,
    );
    return result.rows;
  }

  async claim(
    id: string,
    matchedTransactionId: string,
    confirmedBy: string | undefined,
    client?: DbClient,
  ): Promise<BankTransferRequestRow | null> {
    const result = await this.db.query<BankTransferRequestRow>(
      `UPDATE bank_transfer_requests
       SET status = 'MATCHED', matched_transaction_id = $2, confirmed_by = $3, resolved_at = now()
       WHERE id = $1 AND status = 'WAITING'
       RETURNING ${SELECT_COLUMNS}`,
      [id, matchedTransactionId, confirmedBy ?? null],
      client,
    );
    return result.rows[0] ?? null;
  }

  async cancel(id: string, client?: DbClient): Promise<BankTransferRequestRow | null> {
    const result = await this.db.query<BankTransferRequestRow>(
      `UPDATE bank_transfer_requests
       SET status = 'CANCELLED', resolved_at = now()
       WHERE id = $1 AND status = 'WAITING'
       RETURNING ${SELECT_COLUMNS}`,
      [id],
      client,
    );
    return result.rows[0] ?? null;
  }

  async release(id: string, client?: DbClient): Promise<void> {
    await this.db.query(
      `UPDATE bank_transfer_requests
       SET status = 'WAITING', matched_transaction_id = NULL, confirmed_by = NULL, resolved_at = NULL
       WHERE id = $1`,
      [id],
      client,
    );
  }
}
