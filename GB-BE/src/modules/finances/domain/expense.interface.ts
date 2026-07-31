import { ExpenseCategory } from './expense.types';

export interface Expense {
  id: string;
  businessId: string;
  branchId: string | null;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseRow {
  id: string;
  business_id: string;
  branch_id: string | null;
  category: ExpenseCategory;
  description: string;
  amount: string;
  expense_date: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ExpenseCategoryTotalRow {
  category: ExpenseCategory;
  total: string;
}
