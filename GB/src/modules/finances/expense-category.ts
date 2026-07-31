import type { ExpenseCategory } from './types/expense.types';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  COGS: 'Costo de ventas',
  OPERATING: 'Gastos operativos',
  PAYROLL: 'Nómina',
  MARKETING: 'Marketing',
  OTHER: 'Otros',
};
