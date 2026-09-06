import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type { Branch, BranchFilters, UpdateBranchPayload } from '../types/branch.types';

export const branchesApi = {
  async getBranches(filters: BranchFilters = {}): Promise<PaginatedResponse<Branch>> {
    const { data } = await apiClient.get<PaginatedResponse<Branch>>('/branches', {
      params: filters,
    });
    return data;
  },

  async getBranch(id: string): Promise<Branch> {
    const { data } = await apiClient.get<ApiResponse<Branch>>(`/branches/${id}`);
    return data.data;
  },

  async updateBranch(id: string, payload: UpdateBranchPayload): Promise<Branch> {
    const { data } = await apiClient.patch<ApiResponse<Branch>>(`/branches/${id}`, payload);
    return data.data;
  },
};
