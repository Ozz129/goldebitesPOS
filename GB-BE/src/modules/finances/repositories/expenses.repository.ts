import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import {
  ExpenseCategoryTotalRow,
  ExpenseRow,
} from '../domain/expense.interface';
import {
  CreateExpenseData,
  ExpenseQuery,
  ExpenseSummaryQuery,
  UpdateExpenseData,
} from '../domain/expense.types';
import { IExpensesRepository } from './expenses.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, category, description, amount, expense_date, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class ExpensesRepository implements IExpensesRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateExpenseData,
    client?: DbClient,
  ): Promise<ExpenseRow> {
    const result = await this.db.query<ExpenseRow>(
      `INSERT INTO expenses (business_id, branch_id, category, description, amount, expense_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.branchId ?? null,
        data.category,
        data.description,
        data.amount,
        data.expenseDate,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ExpenseRow | null> {
    const result = await this.db.query<ExpenseRow>(
      `SELECT ${SELECT_COLUMNS} FROM expenses
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: ExpenseQuery,
  ): Promise<{ rows: ExpenseRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.category) {
      params.push(query.category);
      conditions.push(`category = $${params.length}`);
    }

    if (query.dateFrom) {
      params.push(query.dateFrom);
      conditions.push(`expense_date >= $${params.length}`);
    }

    if (query.dateTo) {
      params.push(query.dateTo);
      conditions.push(`expense_date <= $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM expenses WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<ExpenseRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM expenses
       WHERE ${whereClause}
       ORDER BY expense_date DESC, created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateExpenseData,
  ): Promise<ExpenseRow | null> {
    const result = await this.db.query<ExpenseRow>(
      `UPDATE expenses
       SET branch_id = COALESCE($3, branch_id),
           category = COALESCE($4, category),
           description = COALESCE($5, description),
           amount = COALESCE($6, amount),
           expense_date = COALESCE($7, expense_date)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.branchId ?? null,
        data.category ?? null,
        data.description ?? null,
        data.amount ?? null,
        data.expenseDate ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(id: string, businessId: string): Promise<ExpenseRow | null> {
    const result = await this.db.query<ExpenseRow>(
      `UPDATE expenses SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }

  async getSummaryByCategory(
    query: ExpenseSummaryQuery,
  ): Promise<ExpenseCategoryTotalRow[]> {
    const result = await this.db.query<ExpenseCategoryTotalRow>(
      `SELECT category, COALESCE(SUM(amount), 0)::text AS total
       FROM expenses
       WHERE business_id = $1 AND deleted_at IS NULL AND expense_date >= $2 AND expense_date <= $3
       GROUP BY category`,
      [query.businessId, query.dateFrom, query.dateTo],
    );
    return result.rows;
  }
}
