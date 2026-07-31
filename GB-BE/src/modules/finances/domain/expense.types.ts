export enum ExpenseCategory {
  COGS = 'COGS',
  OPERATING = 'OPERATING',
  PAYROLL = 'PAYROLL',
  MARKETING = 'MARKETING',
  OTHER = 'OTHER',
}

export interface CreateExpenseData {
  businessId: string;
  branchId?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
}

export interface UpdateExpenseData {
  branchId?: string;
  category?: ExpenseCategory;
  description?: string;
  amount?: number;
  expenseDate?: string;
}

export interface ExpenseQuery {
  businessId: string;
  page: number;
  limit: number;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExpenseSummaryQuery {
  businessId: string;
  dateFrom: string;
  dateTo: string;
}

export interface ExpenseCategoryTotal {
  category: ExpenseCategory;
  total: number;
}
