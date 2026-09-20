import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { ReimbursementObligationRow } from '../domain/reimbursement.interface';
import {
  CreateReimbursementObligationData,
  ReimbursementObligationQuery,
  ReimbursementObligationStatus,
  ReimbursementObligationSummary,
} from '../domain/reimbursement.types';
import { IReimbursementObligationsRepository } from './reimbursement-obligations.repository.interface';

/**
 * reimbursed_amount is never a stored column — it's always the SUM of that
 * obligation's reimbursement_payments, joined in on every read, same
 * principle already used for inventory stock (computed from movements).
 */
const SELECT_WITH_REIMBURSED = `
  SELECT o.id, o.business_id, o.expense_id, o.payer_employee_id, o.payer_name,
         o.original_amount::text AS original_amount,
         COALESCE(p.reimbursed, 0)::text AS reimbursed_amount,
         o.status, o.voided_at, o.voided_by, o.void_reason, o.created_at, o.updated_at
  FROM reimbursement_obligations o
  LEFT JOIN (
    SELECT obligation_id, SUM(amount) AS reimbursed
    FROM reimbursement_payments
    GROUP BY obligation_id
  ) p ON p.obligation_id = o.id
`;

interface CountRow {
  count: string;
}

interface SummaryRow {
  pending_count: string;
  pending_total: string;
}

@Injectable()
export class ReimbursementObligationsRepository implements IReimbursementObligationsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateReimbursementObligationData,
    client?: DbClient,
  ): Promise<ReimbursementObligationRow> {
    const result = await this.db.query<{
      id: string;
      business_id: string;
      expense_id: string;
      payer_employee_id: string | null;
      payer_name: string;
      original_amount: string;
      status: ReimbursementObligationStatus;
      voided_at: Date | null;
      voided_by: string | null;
      void_reason: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `INSERT INTO reimbursement_obligations (business_id, expense_id, payer_employee_id, payer_name, original_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, business_id, expense_id, payer_employee_id, payer_name, original_amount::text, status, voided_at, voided_by, void_reason, created_at, updated_at`,
      [
        data.businessId,
        data.expenseId,
        data.payerEmployeeId ?? null,
        data.payerName,
        data.originalAmount,
      ],
      client,
    );
    const row = result.rows[0];
    // No payments can exist yet for a just-created obligation.
    return { ...row, reimbursed_amount: '0' };
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ReimbursementObligationRow | null> {
    const result = await this.db.query<ReimbursementObligationRow>(
      `${SELECT_WITH_REIMBURSED} WHERE o.id = $1 AND o.business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findActiveByExpenseId(
    expenseId: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ReimbursementObligationRow | null> {
    const result = await this.db.query<ReimbursementObligationRow>(
      `${SELECT_WITH_REIMBURSED} WHERE o.expense_id = $1 AND o.business_id = $2 AND o.status != 'VOIDED'`,
      [expenseId, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: ReimbursementObligationQuery,
  ): Promise<{ rows: ReimbursementObligationRow[]; total: number }> {
    const conditions: string[] = ['o.business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.status) {
      params.push(query.status);
      conditions.push(`o.status = $${params.length}`);
    }

    if (query.payerEmployeeId) {
      params.push(query.payerEmployeeId);
      conditions.push(`o.payer_employee_id = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM reimbursement_obligations o WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<ReimbursementObligationRow>(
      `${SELECT_WITH_REIMBURSED}
       WHERE ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async updateStatus(
    id: string,
    status: ReimbursementObligationStatus,
    client?: DbClient,
  ): Promise<void> {
    await this.db.query(
      `UPDATE reimbursement_obligations SET status = $2 WHERE id = $1`,
      [id, status],
      client,
    );
  }

  async void(
    id: string,
    voidedBy: string,
    reason: string,
    client?: DbClient,
  ): Promise<ReimbursementObligationRow | null> {
    await this.db.query(
      `UPDATE reimbursement_obligations
       SET status = 'VOIDED', voided_at = now(), voided_by = $2, void_reason = $3
       WHERE id = $1`,
      [id, voidedBy, reason],
      client,
    );
    const result = await this.db.query<ReimbursementObligationRow>(
      `${SELECT_WITH_REIMBURSED} WHERE o.id = $1`,
      [id],
      client,
    );
    return result.rows[0] ?? null;
  }

  async getSummary(businessId: string): Promise<ReimbursementObligationSummary> {
    const result = await this.db.query<SummaryRow>(
      `SELECT COUNT(*)::text AS pending_count, COALESCE(SUM(o.original_amount - COALESCE(p.reimbursed, 0)), 0)::text AS pending_total
       FROM reimbursement_obligations o
       LEFT JOIN (
         SELECT obligation_id, SUM(amount) AS reimbursed
         FROM reimbursement_payments
         GROUP BY obligation_id
       ) p ON p.obligation_id = o.id
       WHERE o.business_id = $1 AND o.status IN ('PENDING', 'PARTIALLY_REIMBURSED')`,
      [businessId],
    );
    const row = result.rows[0];
    return {
      pendingCount: parseInt(row?.pending_count ?? '0', 10),
      pendingTotalAmount: parseFloat(row?.pending_total ?? '0'),
    };
  }
}
