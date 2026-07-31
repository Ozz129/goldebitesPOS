import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '../api/expenses.api';
import { expenseKeys } from '../api/expenses.keys';
import type { ExpenseFilters } from '../types/expense.types';

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => expensesApi.getExpenses(filters),
    staleTime: 30_000,
  });
}
