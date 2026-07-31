import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { Business, UpdateBusinessPayload } from '../types/business.types';

export const businessesApi = {
  async getMine(): Promise<Business> {
    const { data } = await apiClient.get<ApiResponse<Business>>('/businesses/me');
    return data.data;
  },

  async updateMine(payload: UpdateBusinessPayload): Promise<Business> {
    const { data } = await apiClient.patch<ApiResponse<Business>>('/businesses/me', payload);
    return data.data;
  },
};
