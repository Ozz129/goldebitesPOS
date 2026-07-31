import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '../api/expenses.api';
import { expenseKeys } from '../api/expenses.keys';

export function useExpenseSummary(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: expenseKeys.summary(dateFrom, dateTo),
    queryFn: () => expensesApi.getSummary(dateFrom, dateTo),
    staleTime: 30_000,
  });
}
