import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { Permission } from '../types/permission.types';

export const permissionsApi = {
  async getCatalog(): Promise<Permission[]> {
    const { data } = await apiClient.get<ApiResponse<Permission[]>>('/permissions');
    return data.data;
  },
};
