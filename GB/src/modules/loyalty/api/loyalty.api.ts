import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateRewardPayload,
  LoyaltyConfig,
  LoyaltyMovement,
  LoyaltyReward,
  MovementFilters,
  RedeemRewardPayload,
  RewardFilters,
  UpdateLoyaltyConfigPayload,
  UpdateRewardPayload,
} from '../types/loyalty.types';

export const loyaltyApi = {
  async getConfig(): Promise<LoyaltyConfig> {
    const { data } = await apiClient.get<ApiResponse<LoyaltyConfig>>('/loyalty/config');
    return data.data;
  },

  async updateConfig(payload: UpdateLoyaltyConfigPayload): Promise<LoyaltyConfig> {
    const { data } = await apiClient.patch<ApiResponse<LoyaltyConfig>>('/loyalty/config', payload);
    return data.data;
  },

  async getRewards(filters: RewardFilters = {}): Promise<PaginatedResponse<LoyaltyReward>> {
    const { data } = await apiClient.get<PaginatedResponse<LoyaltyReward>>('/loyalty-rewards', {
      params: filters,
    });
    return data;
  },

  async createReward(payload: CreateRewardPayload): Promise<LoyaltyReward> {
    const { data } = await apiClient.post<ApiResponse<LoyaltyReward>>('/loyalty-rewards', payload);
    return data.data;
  },

  async updateReward(id: string, payload: UpdateRewardPayload): Promise<LoyaltyReward> {
    const { data } = await apiClient.patch<ApiResponse<LoyaltyReward>>(`/loyalty-rewards/${id}`, payload);
    return data.data;
  },

  async setRewardStatus(id: string, isActive: boolean): Promise<LoyaltyReward> {
    const { data } = await apiClient.patch<ApiResponse<LoyaltyReward>>(`/loyalty-rewards/${id}/status`, {
      isActive,
    });
    return data.data;
  },

  async deleteReward(id: string): Promise<void> {
    await apiClient.delete(`/loyalty-rewards/${id}`);
  },

  async getMovements(filters: MovementFilters = {}): Promise<PaginatedResponse<LoyaltyMovement>> {
    const { data } = await apiClient.get<PaginatedResponse<LoyaltyMovement>>('/loyalty/movements', {
      params: filters,
    });
    return data;
  },

  async redeem(payload: RedeemRewardPayload): Promise<LoyaltyMovement> {
    const { data } = await apiClient.post<ApiResponse<LoyaltyMovement>>('/loyalty/redemptions', payload);
    return data.data;
  },
};
