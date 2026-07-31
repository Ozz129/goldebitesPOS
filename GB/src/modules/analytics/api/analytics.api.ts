import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type {
  AnalyticsRangeFilters,
  DailySales,
  TopProduct,
  TopProductsFilters,
} from '../types/analytics.types';

export const analyticsApi = {
  async getSales(filters: AnalyticsRangeFilters): Promise<DailySales[]> {
    const { data } = await apiClient.get<ApiResponse<DailySales[]>>('/analytics/sales', {
      params: filters,
    });
    return data.data;
  },

  async getTopProducts(filters: TopProductsFilters): Promise<TopProduct[]> {
    const { data } = await apiClient.get<ApiResponse<TopProduct[]>>('/analytics/top-products', {
      params: filters,
    });
    return data.data;
  },
};
