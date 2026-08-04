import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type {
  Business,
  BusinessUserSummary,
  CreatePlatformBusinessPayload,
  FeatureStatus,
} from '../types/platform-admin.types';

export const platformAdminApi = {
  async getBusinesses(): Promise<Business[]> {
    const { data } = await apiClient.get<ApiResponse<Business[]>>('/platform-admin/businesses');
    return data.data;
  },

  async createBusiness(payload: CreatePlatformBusinessPayload): Promise<Business> {
    const { data } = await apiClient.post<ApiResponse<Business>>('/platform-admin/businesses', payload);
    return data.data;
  },

  async getFeatures(businessId: string): Promise<FeatureStatus[]> {
    const { data } = await apiClient.get<ApiResponse<FeatureStatus[]>>(
      `/platform-admin/businesses/${businessId}/features`,
    );
    return data.data;
  },

  async setFeature(businessId: string, featureKey: string, enabled: boolean): Promise<void> {
    await apiClient.put(`/platform-admin/businesses/${businessId}/features/${featureKey}`, { enabled });
  },

  async getUsers(businessId: string): Promise<BusinessUserSummary[]> {
    const { data } = await apiClient.get<ApiResponse<BusinessUserSummary[]>>(
      `/platform-admin/businesses/${businessId}/users`,
    );
    return data.data;
  },

  async resetUserPassword(businessId: string, userId: string): Promise<{ temporaryPassword: string }> {
    const { data } = await apiClient.post<ApiResponse<{ temporaryPassword: string }>>(
      `/platform-admin/businesses/${businessId}/users/${userId}/reset-password`,
    );
    return data.data;
  },
};
