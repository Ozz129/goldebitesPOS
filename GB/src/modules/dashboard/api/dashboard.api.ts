import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { DashboardSummary } from '../types/dashboard.types';

export const dashboardApi = {
  async getSummary(branchId?: string): Promise<DashboardSummary> {
    const { data } = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary', {
      params: branchId ? { branchId } : undefined,
    });
    return data.data;
  },
};
