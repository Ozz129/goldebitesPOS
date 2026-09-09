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

  async uploadLogo(file: File): Promise<Business> {
    const formData = new FormData();
    formData.append('file', file);
    // apiClient sets a default 'application/json' Content-Type on the instance, which
    // takes precedence over axios's usual auto-detection of FormData — clearing it here
    // lets the browser generate the correct 'multipart/form-data; boundary=...' header.
    const { data } = await apiClient.post<ApiResponse<Business>>('/businesses/me/logo', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data.data;
  },

  async getLogoBlob(): Promise<Blob> {
    const { data } = await apiClient.get<Blob>('/businesses/me/logo', { responseType: 'blob' });
    return data;
  },

  async deleteLogo(): Promise<void> {
    await apiClient.delete('/businesses/me/logo');
  },
};
