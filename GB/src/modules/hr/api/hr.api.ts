import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { BranchRule, BranchRuleInput, HrProfile } from '../types/hr.types';

export const hrApi = {
  async getBranchRules(branchId: string): Promise<BranchRule[]> {
    const { data } = await apiClient.get<ApiResponse<BranchRule[]>>('/hr/branch-rules', {
      params: { branchId },
    });
    return data.data;
  },

  async setBranchRules(branchId: string, rules: BranchRuleInput[]): Promise<BranchRule[]> {
    const { data } = await apiClient.put<ApiResponse<BranchRule[]>>(
      '/hr/branch-rules',
      { rules },
      { params: { branchId } },
    );
    return data.data;
  },

  async getMyProfile(): Promise<HrProfile> {
    const { data } = await apiClient.get<ApiResponse<HrProfile>>('/hr/my-profile');
    return data.data;
  },
};
