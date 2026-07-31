import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreatePurchaseOrderPayload,
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderWithItems,
} from '../types/purchase-order.types';

export const purchaseOrdersApi = {
  async getOrders(filters: PurchaseOrderFilters = {}): Promise<PaginatedResponse<PurchaseOrder>> {
    const { data } = await apiClient.get<PaginatedResponse<PurchaseOrder>>('/purchase-orders', {
      params: filters,
    });
    return data;
  },

  async getOrder(id: string): Promise<PurchaseOrderWithItems> {
    const { data } = await apiClient.get<ApiResponse<PurchaseOrderWithItems>>(
      `/purchase-orders/${id}`,
    );
    return data.data;
  },

  async createOrder(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrderWithItems> {
    const { data } = await apiClient.post<ApiResponse<PurchaseOrderWithItems>>(
      '/purchase-orders',
      payload,
    );
    return data.data;
  },

  async submit(id: string): Promise<PurchaseOrderWithItems> {
    const { data } = await apiClient.post<ApiResponse<PurchaseOrderWithItems>>(
      `/purchase-orders/${id}/submit`,
    );
    return data.data;
  },

  async approve(id: string): Promise<PurchaseOrderWithItems> {
    const { data } = await apiClient.post<ApiResponse<PurchaseOrderWithItems>>(
      `/purchase-orders/${id}/approve`,
    );
    return data.data;
  },

  async cancel(id: string): Promise<PurchaseOrderWithItems> {
    const { data } = await apiClient.post<ApiResponse<PurchaseOrderWithItems>>(
      `/purchase-orders/${id}/cancel`,
    );
    return data.data;
  },
};
