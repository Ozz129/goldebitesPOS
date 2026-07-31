import {
  Expense,
  ExpenseCategoryTotalRow,
  ExpenseRow,
} from '../domain/expense.interface';
import { ExpenseCategoryTotal } from '../domain/expense.types';

export class ExpenseMapper {
  static toDomain(row: ExpenseRow): Expense {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      category: row.category,
      description: row.description,
      amount: parseFloat(row.amount),
      expenseDate: row.expense_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static categoryTotalToDomain(
    row: ExpenseCategoryTotalRow,
  ): ExpenseCategoryTotal {
    return {
      category: row.category,
      total: parseFloat(row.total),
    };
  }
}
