import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateExpensePayload,
  Expense,
  ExpenseCategoryTotal,
  ExpenseFilters,
  UpdateExpensePayload,
} from '../types/expense.types';

export const expensesApi = {
  async getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> {
    const { data } = await apiClient.get<PaginatedResponse<Expense>>('/expenses', {
      params: filters,
    });
    return data;
  },

  async createExpense(payload: CreateExpensePayload): Promise<Expense> {
    const { data } = await apiClient.post<ApiResponse<Expense>>('/expenses', payload);
    return data.data;
  },

  async updateExpense(id: string, payload: UpdateExpensePayload): Promise<Expense> {
    const { data } = await apiClient.patch<ApiResponse<Expense>>(`/expenses/${id}`, payload);
    return data.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  },

  async getSummary(dateFrom: string, dateTo: string): Promise<ExpenseCategoryTotal[]> {
    const { data } = await apiClient.get<ApiResponse<ExpenseCategoryTotal[]>>('/expenses/summary', {
      params: { dateFrom, dateTo },
    });
    return data.data;
  },
};
