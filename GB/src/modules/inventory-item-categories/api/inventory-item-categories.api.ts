import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateInventoryItemCategoryPayload,
  InventoryItemCategory,
  InventoryItemCategoryFilters,
  UpdateInventoryItemCategoryPayload,
} from '../types/inventory-item-category.types';

export const inventoryItemCategoriesApi = {
  async getCategories(
    filters: InventoryItemCategoryFilters = {},
  ): Promise<PaginatedResponse<InventoryItemCategory>> {
    const { data } = await apiClient.get<PaginatedResponse<InventoryItemCategory>>(
      '/inventory-item-categories',
      { params: filters },
    );
    return data;
  },

  async getCategory(id: string): Promise<InventoryItemCategory> {
    const { data } = await apiClient.get<ApiResponse<InventoryItemCategory>>(
      `/inventory-item-categories/${id}`,
    );
    return data.data;
  },

  async createCategory(
    payload: CreateInventoryItemCategoryPayload,
  ): Promise<InventoryItemCategory> {
    const { data } = await apiClient.post<ApiResponse<InventoryItemCategory>>(
      '/inventory-item-categories',
      payload,
    );
    return data.data;
  },

  async updateCategory(
    id: string,
    payload: UpdateInventoryItemCategoryPayload,
  ): Promise<InventoryItemCategory> {
    const { data } = await apiClient.patch<ApiResponse<InventoryItemCategory>>(
      `/inventory-item-categories/${id}`,
      payload,
    );
    return data.data;
  },

  async setCategoryStatus(id: string, isActive: boolean): Promise<InventoryItemCategory> {
    const { data } = await apiClient.patch<ApiResponse<InventoryItemCategory>>(
      `/inventory-item-categories/${id}/status`,
      { isActive },
    );
    return data.data;
  },
};
