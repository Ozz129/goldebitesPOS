import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateInventoryQueryTemplatePayload,
  InventoryQueryResultItem,
  InventoryQueryTemplate,
  RunInventoryQueryPayload,
} from '../types/inventory-query.types';

export const inventoryQueryApi = {
  async runQuery(payload: RunInventoryQueryPayload): Promise<PaginatedResponse<InventoryQueryResultItem>> {
    const { data } = await apiClient.post<PaginatedResponse<InventoryQueryResultItem>>(
      '/inventory-items/query',
      payload,
    );
    return data;
  },

  async getTemplates(): Promise<InventoryQueryTemplate[]> {
    const { data } = await apiClient.get<ApiResponse<InventoryQueryTemplate[]>>('/inventory-query-templates');
    return data.data;
  },

  async createTemplate(payload: CreateInventoryQueryTemplatePayload): Promise<InventoryQueryTemplate> {
    const { data } = await apiClient.post<ApiResponse<InventoryQueryTemplate>>(
      '/inventory-query-templates',
      payload,
    );
    return data.data;
  },

  async runTemplate(
    id: string,
    payload: { branchId?: string; page?: number; limit?: number } = {},
  ): Promise<PaginatedResponse<InventoryQueryResultItem>> {
    const { data } = await apiClient.post<PaginatedResponse<InventoryQueryResultItem>>(
      `/inventory-query-templates/${id}/run`,
      payload,
    );
    return data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/inventory-query-templates/${id}`);
  },
};
