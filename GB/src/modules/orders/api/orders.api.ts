import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateOrderItemPayload,
  CreateOrderPayload,
  Order,
  OrderFilters,
  OrderStatus,
  OrderWithItems,
} from '../types/order.types';
import type { CreatePaymentPayload, Payment } from '../types/payment.types';

export const ordersApi = {
  async getOrders(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<PaginatedResponse<Order>>('/orders', { params: filters });
    return data;
  },

  async getOrder(id: string): Promise<OrderWithItems> {
    const { data } = await apiClient.get<ApiResponse<OrderWithItems>>(`/orders/${id}`);
    return data.data;
  },

  async createOrder(payload: CreateOrderPayload): Promise<OrderWithItems> {
    const { data } = await apiClient.post<ApiResponse<OrderWithItems>>('/orders', payload);
    return data.data;
  },

  async replaceItems(id: string, items: CreateOrderItemPayload[]): Promise<OrderWithItems> {
    const { data } = await apiClient.put<ApiResponse<OrderWithItems>>(`/orders/${id}/items`, {
      items,
    });
    return data.data;
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
    notes?: string,
  ): Promise<OrderWithItems> {
    const { data } = await apiClient.patch<ApiResponse<OrderWithItems>>(`/orders/${id}/status`, {
      status,
      notes,
    });
    return data.data;
  },

  async getPayments(orderId: string): Promise<Payment[]> {
    const { data } = await apiClient.get<ApiResponse<Payment[]>>(`/orders/${orderId}/payments`);
    return data.data;
  },

  async createPayment(orderId: string, payload: CreatePaymentPayload): Promise<Payment> {
    const { data } = await apiClient.post<ApiResponse<Payment>>(
      `/orders/${orderId}/payments`,
      payload,
    );
    return data.data;
  },
};
