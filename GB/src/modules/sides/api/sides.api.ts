import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateSidePayload,
  Side,
  SideFilters,
  UpdateSidePayload,
} from '../types/side.types';

export const sidesApi = {
  async getSides(filters: SideFilters = {}): Promise<PaginatedResponse<Side>> {
    const { data } = await apiClient.get<PaginatedResponse<Side>>('/sides', {
      params: filters,
    });
    return data;
  },

  async getSide(id: string): Promise<Side> {
    const { data } = await apiClient.get<ApiResponse<Side>>(`/sides/${id}`);
    return data.data;
  },

  async createSide(payload: CreateSidePayload): Promise<Side> {
    const { data } = await apiClient.post<ApiResponse<Side>>('/sides', payload);
    return data.data;
  },

  async updateSide(id: string, payload: UpdateSidePayload): Promise<Side> {
    const { data } = await apiClient.patch<ApiResponse<Side>>(`/sides/${id}`, payload);
    return data.data;
  },

  async setSideStatus(id: string, isActive: boolean): Promise<Side> {
    const { data } = await apiClient.patch<ApiResponse<Side>>(`/sides/${id}/status`, {
      isActive,
    });
    return data.data;
  },
};
