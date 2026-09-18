import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { PublicMenu } from '../types/public-menu.types';

export const publicMenuApi = {
  async getMenu(businessId: string): Promise<PublicMenu> {
    const { data } = await apiClient.get<ApiResponse<PublicMenu>>(`/public/menu/${businessId}`);
    return data.data;
  },
};
