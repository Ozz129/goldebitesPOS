import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateAdjustmentPayload,
  CreateInventoryItemPayload,
  InventoryItem,
  InventoryItemFilters,
  InventoryMovement,
  LowStockAlert,
  MovementFilters,
  StockFilters,
  StockLevel,
  UpdateInventoryItemPayload,
} from '../types/inventory.types';

export const inventoryApi = {
  async getItems(filters: InventoryItemFilters = {}): Promise<PaginatedResponse<InventoryItem>> {
    const { data } = await apiClient.get<PaginatedResponse<InventoryItem>>('/inventory-items', {
      params: filters,
    });
    return data;
  },

  async getItem(id: string): Promise<InventoryItem> {
    const { data } = await apiClient.get<ApiResponse<InventoryItem>>(`/inventory-items/${id}`);
    return data.data;
  },

  async createItem(payload: CreateInventoryItemPayload): Promise<InventoryItem> {
    const { data } = await apiClient.post<ApiResponse<InventoryItem>>('/inventory-items', payload);
    return data.data;
  },

  async updateItem(id: string, payload: UpdateInventoryItemPayload): Promise<InventoryItem> {
    const { data } = await apiClient.patch<ApiResponse<InventoryItem>>(
      `/inventory-items/${id}`,
      payload,
    );
    return data.data;
  },

  async setItemStatus(id: string, isActive: boolean): Promise<InventoryItem> {
    const { data } = await apiClient.patch<ApiResponse<InventoryItem>>(
      `/inventory-items/${id}/status`,
      { isActive },
    );
    return data.data;
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`/inventory-items/${id}`);
  },

  async getStock(filters: StockFilters = {}): Promise<StockLevel[]> {
    const { data } = await apiClient.get<ApiResponse<StockLevel[]>>('/inventory/stock', {
      params: filters,
    });
    return data.data;
  },

  async getLowStock(branchId?: string): Promise<LowStockAlert[]> {
    const { data } = await apiClient.get<ApiResponse<LowStockAlert[]>>('/inventory/low-stock', {
      params: branchId ? { branchId } : undefined,
    });
    return data.data;
  },

  async getMovements(filters: MovementFilters = {}): Promise<PaginatedResponse<InventoryMovement>> {
    const { data } = await apiClient.get<PaginatedResponse<InventoryMovement>>('/inventory/movements', {
      params: filters,
    });
    return data;
  },

  async createAdjustment(payload: CreateAdjustmentPayload): Promise<InventoryMovement> {
    const { data } = await apiClient.post<ApiResponse<InventoryMovement>>(
      '/inventory/adjustments',
      payload,
    );
    return data.data;
  },
};
