import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateCustomerAddressPayload,
  CreateCustomerPayload,
  Customer,
  CustomerAddress,
  CustomerFilters,
  UpdateCustomerPayload,
} from '../types/customer.types';

export const customersApi = {
  async getCustomers(filters: CustomerFilters = {}): Promise<PaginatedResponse<Customer>> {
    const { data } = await apiClient.get<PaginatedResponse<Customer>>('/customers', {
      params: filters,
    });
    return data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const { data } = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return data.data;
  },

  async createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
    const { data } = await apiClient.post<ApiResponse<Customer>>('/customers', payload);
    return data.data;
  },

  async updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
    const { data } = await apiClient.patch<ApiResponse<Customer>>(`/customers/${id}`, payload);
    return data.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  async listAddresses(customerId: string): Promise<CustomerAddress[]> {
    const { data } = await apiClient.get<ApiResponse<CustomerAddress[]>>(
      `/customers/${customerId}/addresses`,
    );
    return data.data;
  },

  async addAddress(
    customerId: string,
    payload: CreateCustomerAddressPayload,
  ): Promise<CustomerAddress> {
    const { data } = await apiClient.post<ApiResponse<CustomerAddress>>(
      `/customers/${customerId}/addresses`,
      payload,
    );
    return data.data;
  },

  async removeAddress(customerId: string, addressId: string): Promise<void> {
    await apiClient.delete(`/customers/${customerId}/addresses/${addressId}`);
  },
};
