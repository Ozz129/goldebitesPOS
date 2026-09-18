import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { ReimbursementPaymentRow } from '../domain/reimbursement.interface';
import { CreateReimbursementPaymentData } from '../domain/reimbursement.types';
import { IReimbursementPaymentsRepository } from './reimbursement-payments.repository.interface';

const SELECT_COLUMNS = `id, obligation_id, branch_id, cash_movement_id, amount::text AS amount, notes, created_by, created_at`;

@Injectable()
export class ReimbursementPaymentsRepository implements IReimbursementPaymentsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateReimbursementPaymentData,
    client?: DbClient,
  ): Promise<ReimbursementPaymentRow> {
    const result = await this.db.query<ReimbursementPaymentRow>(
      `INSERT INTO reimbursement_payments (obligation_id, branch_id, cash_movement_id, amount, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.obligationId,
        data.branchId,
        data.cashMovementId ?? null,
        data.amount,
        data.notes ?? null,
        data.createdBy ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findByObligation(
    obligationId: string,
    client?: DbClient,
  ): Promise<ReimbursementPaymentRow[]> {
    const result = await this.db.query<ReimbursementPaymentRow>(
      `SELECT ${SELECT_COLUMNS} FROM reimbursement_payments
       WHERE obligation_id = $1
       ORDER BY created_at`,
      [obligationId],
      client,
    );
    return result.rows;
  }
}
