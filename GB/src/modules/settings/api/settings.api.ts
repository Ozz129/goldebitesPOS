import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';

export interface BusinessSettings {
  taxRate: number;
}

export const settingsApi = {
  async get(): Promise<BusinessSettings> {
    const { data } = await apiClient.get<ApiResponse<BusinessSettings>>('/settings');
    return data.data;
  },

  async update(taxRate: number): Promise<BusinessSettings> {
    const { data } = await apiClient.patch<ApiResponse<BusinessSettings>>('/settings', { taxRate });
    return data.data;
  },
};
