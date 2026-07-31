import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import {
  CashMovementRow,
  CashSessionRow,
} from '../domain/cash-session.interface';
import {
  CashSessionQuery,
  OpenCashSessionData,
  RecordCashMovementData,
} from '../domain/cash-session.types';
import { ICashSessionsRepository } from './cash-sessions.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, opened_by, closed_by, opening_amount,
  expected_closing_amount, actual_closing_amount, difference_amount, status, opened_at, closed_at, notes`;

const MOVEMENT_COLUMNS = `id, cash_session_id, order_id, movement_type, payment_method, amount,
  description, created_by, created_at`;

interface CountRow {
  count: string;
}

interface ExpectedRow {
  expected: string;
}

@Injectable()
export class CashSessionsRepository implements ICashSessionsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: OpenCashSessionData,
    openedBy: string,
    client?: DbClient,
  ): Promise<CashSessionRow> {
    const result = await this.db.query<CashSessionRow>(
      `INSERT INTO cash_sessions (business_id, branch_id, opened_by, opening_amount, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.branchId,
        openedBy,
        data.openingAmount,
        data.notes ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<CashSessionRow | null> {
    const result = await this.db.query<CashSessionRow>(
      `SELECT ${SELECT_COLUMNS} FROM cash_sessions WHERE id = $1 AND business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findOpenForBranch(
    businessId: string,
    branchId: string,
    client?: DbClient,
  ): Promise<CashSessionRow | null> {
    const result = await this.db.query<CashSessionRow>(
      `SELECT ${SELECT_COLUMNS} FROM cash_sessions
       WHERE business_id = $1 AND branch_id = $2 AND status = 'OPEN'`,
      [businessId, branchId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: CashSessionQuery,
  ): Promise<{ rows: CashSessionRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.branchId) {
      params.push(query.branchId);
      conditions.push(`branch_id = $${params.length}`);
    }
    if (query.status) {
      params.push(query.status);
      conditions.push(`status = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM cash_sessions WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<CashSessionRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM cash_sessions
       WHERE ${whereClause}
       ORDER BY opened_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async addMovement(
    data: RecordCashMovementData,
    client?: DbClient,
  ): Promise<CashMovementRow> {
    const result = await this.db.query<CashMovementRow>(
      `INSERT INTO cash_movements (cash_session_id, order_id, movement_type, payment_method, amount, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${MOVEMENT_COLUMNS}`,
      [
        data.cashSessionId,
        data.orderId ?? null,
        data.movementType,
        data.paymentMethod ?? null,
        data.amount,
        data.description ?? null,
        data.createdBy ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findMovements(
    cashSessionId: string,
    client?: DbClient,
  ): Promise<CashMovementRow[]> {
    const result = await this.db.query<CashMovementRow>(
      `SELECT ${MOVEMENT_COLUMNS} FROM cash_movements
       WHERE cash_session_id = $1
       ORDER BY created_at`,
      [cashSessionId],
      client,
    );
    return result.rows;
  }

  async getExpectedClosingAmount(
    cashSessionId: string,
    client?: DbClient,
  ): Promise<number> {
    const result = await this.db.query<ExpectedRow>(
      `SELECT (cs.opening_amount + COALESCE(SUM(
         CASE
           WHEN cm.movement_type = 'SALE' AND cm.payment_method = 'CASH' THEN cm.amount
           WHEN cm.movement_type = 'INCOME' THEN cm.amount
           WHEN cm.movement_type IN ('EXPENSE', 'WITHDRAWAL') THEN -cm.amount
           ELSE 0
         END
       ), 0))::text AS expected
       FROM cash_sessions cs
       LEFT JOIN cash_movements cm ON cm.cash_session_id = cs.id
       WHERE cs.id = $1
       GROUP BY cs.id, cs.opening_amount`,
      [cashSessionId],
      client,
    );
    return parseFloat(result.rows[0]?.expected ?? '0');
  }

  async close(
    id: string,
    businessId: string,
    closedBy: string | undefined,
    expectedClosingAmount: number,
    actualClosingAmount: number,
    differenceAmount: number,
    notes: string | undefined,
    client?: DbClient,
  ): Promise<CashSessionRow | null> {
    const result = await this.db.query<CashSessionRow>(
      `UPDATE cash_sessions
       SET status = 'CLOSED',
           closed_by = $3,
           closed_at = now(),
           expected_closing_amount = $4,
           actual_closing_amount = $5,
           difference_amount = $6,
           notes = COALESCE($7, notes)
       WHERE id = $1 AND business_id = $2 AND status = 'OPEN'
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        closedBy ?? null,
        expectedClosingAmount,
        actualClosingAmount,
        differenceAmount,
        notes ?? null,
      ],
      client,
    );
    return result.rows[0] ?? null;
  }
}
