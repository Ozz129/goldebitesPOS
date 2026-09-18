import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateInventoryQueryTemplatePayload,
  InventoryQueryAggregateResult,
  InventoryQueryResultItem,
  InventoryQueryTemplate,
  RunInventoryQueryPayload,
} from '../types/inventory-query.types';

/** DETAIL returns a paginated list; every other intent returns a single aggregate scalar. */
export type InventoryQueryRunResult =
  | PaginatedResponse<InventoryQueryResultItem>
  | ApiResponse<InventoryQueryAggregateResult>;

export function isPaginatedQueryResult(
  result: InventoryQueryRunResult,
): result is PaginatedResponse<InventoryQueryResultItem> {
  return Array.isArray(result.data);
}

export const inventoryQueryApi = {
  async runQuery(payload: RunInventoryQueryPayload): Promise<InventoryQueryRunResult> {
    const { data } = await apiClient.post<InventoryQueryRunResult>('/inventory-items/query', payload);
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
  ): Promise<InventoryQueryRunResult> {
    const { data } = await apiClient.post<InventoryQueryRunResult>(
      `/inventory-query-templates/${id}/run`,
      payload,
    );
    return data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/inventory-query-templates/${id}`);
  },
};
