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

export interface IExpensesRepository {
  create(data: CreateExpenseData, client?: DbClient): Promise<ExpenseRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ExpenseRow | null>;
  findAll(query: ExpenseQuery): Promise<{ rows: ExpenseRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateExpenseData,
  ): Promise<ExpenseRow | null>;
  softDelete(id: string, businessId: string): Promise<ExpenseRow | null>;
  getSummaryByCategory(
    query: ExpenseSummaryQuery,
  ): Promise<ExpenseCategoryTotalRow[]>;
}

export const EXPENSES_REPOSITORY = Symbol('EXPENSES_REPOSITORY');
