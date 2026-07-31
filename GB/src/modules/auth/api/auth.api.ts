import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { CurrentUserProfile, LoginPayload, LoginResponseData } from '../types/auth.types';

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponseData> {
    const { data } = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
    return data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  async getCurrentUser(): Promise<CurrentUserProfile> {
    const { data } = await apiClient.get<ApiResponse<CurrentUserProfile>>('/users/me');
    return data.data;
  },
};
