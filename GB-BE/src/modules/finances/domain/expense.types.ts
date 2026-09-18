export enum ExpenseCategory {
  COGS = 'COGS',
  OPERATING = 'OPERATING',
  PAYROLL = 'PAYROLL',
  MARKETING = 'MARKETING',
  OTHER = 'OTHER',
}

/** Whether an expense drew from Golden Bites' own funds, or from someone's personal money (creates a reimbursement obligation instead). */
export enum ExpensePaymentSource {
  BUSINESS_FUNDS = 'BUSINESS_FUNDS',
  PERSONAL_MONEY = 'PERSONAL_MONEY',
}

export interface CreateExpenseData {
  businessId: string;
  branchId?: string;
  category: ExpenseCategory;
  name: string;
  description: string;
  responsible: string;
  amount: number;
  expenseDate: string;
  paymentSource: ExpensePaymentSource;
  payerEmployeeId?: string;
  payerName?: string;
}

export interface UpdateExpenseData {
  branchId?: string;
  category?: ExpenseCategory;
  name?: string;
  description?: string;
  responsible?: string;
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
