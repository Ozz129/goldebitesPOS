export type ExpenseCategory = 'COGS' | 'OPERATING' | 'PAYROLL' | 'MARKETING' | 'OTHER';

export interface Expense {
  id: string;
  businessId: string;
  branchId: string | null;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  branchId?: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExpenseCategoryTotal {
  category: ExpenseCategory;
  total: number;
}
