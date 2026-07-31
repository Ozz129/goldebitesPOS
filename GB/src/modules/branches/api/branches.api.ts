import { apiClient } from '../../../lib/api/api-client';
import type { PaginatedResponse } from '../../../lib/api/api-types';
import type { Branch, BranchFilters } from '../types/branch.types';

export const branchesApi = {
  async getBranches(filters: BranchFilters = {}): Promise<PaginatedResponse<Branch>> {
    const { data } = await apiClient.get<PaginatedResponse<Branch>>('/branches', {
      params: filters,
    });
    return data;
  },
};
