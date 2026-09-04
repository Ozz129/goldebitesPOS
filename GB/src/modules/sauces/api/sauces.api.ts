import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateSaucePayload,
  Sauce,
  SauceFilters,
  UpdateSaucePayload,
} from '../types/sauce.types';

export const saucesApi = {
  async getSauces(filters: SauceFilters = {}): Promise<PaginatedResponse<Sauce>> {
    const { data } = await apiClient.get<PaginatedResponse<Sauce>>('/sauces', {
      params: filters,
    });
    return data;
  },

  async getSauce(id: string): Promise<Sauce> {
    const { data } = await apiClient.get<ApiResponse<Sauce>>(`/sauces/${id}`);
    return data.data;
  },

  async createSauce(payload: CreateSaucePayload): Promise<Sauce> {
    const { data } = await apiClient.post<ApiResponse<Sauce>>('/sauces', payload);
    return data.data;
  },

  async updateSauce(id: string, payload: UpdateSaucePayload): Promise<Sauce> {
    const { data } = await apiClient.patch<ApiResponse<Sauce>>(`/sauces/${id}`, payload);
    return data.data;
  },

  async setSauceStatus(id: string, isActive: boolean): Promise<Sauce> {
    const { data } = await apiClient.patch<ApiResponse<Sauce>>(`/sauces/${id}/status`, {
      isActive,
    });
    return data.data;
  },
};
