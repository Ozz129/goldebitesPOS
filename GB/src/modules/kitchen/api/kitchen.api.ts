import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { Order, OrderStatus, OrderWithItems } from '../../orders/types/order.types';

export const kitchenApi = {
  async getQueue(branchId?: string): Promise<Order[]> {
    const { data } = await apiClient.get<ApiResponse<Order[]>>('/kitchen/orders', {
      params: branchId ? { branchId } : undefined,
    });
    return data.data;
  },

  /** Kitchen can only move an order to PREPARING or READY. */
  async updateStatus(orderId: string, status: Extract<OrderStatus, 'PREPARING' | 'READY'>): Promise<OrderWithItems> {
    const { data } = await apiClient.patch<ApiResponse<OrderWithItems>>(
      `/kitchen/orders/${orderId}/status`,
      { status },
    );
    return data.data;
  },
};
