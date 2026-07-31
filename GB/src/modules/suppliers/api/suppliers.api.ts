import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateSupplierPayload,
  Supplier,
  SupplierFilters,
  UpdateSupplierPayload,
} from '../types/supplier.types';

export const suppliersApi = {
  async getSuppliers(filters: SupplierFilters = {}): Promise<PaginatedResponse<Supplier>> {
    const { data } = await apiClient.get<PaginatedResponse<Supplier>>('/suppliers', {
      params: filters,
    });
    return data;
  },

  async getSupplier(id: string): Promise<Supplier> {
    const { data } = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return data.data;
  },

  async createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
    const { data } = await apiClient.post<ApiResponse<Supplier>>('/suppliers', payload);
    return data.data;
  },

  async updateSupplier(id: string, payload: UpdateSupplierPayload): Promise<Supplier> {
    const { data } = await apiClient.patch<ApiResponse<Supplier>>(`/suppliers/${id}`, payload);
    return data.data;
  },

  async setSupplierStatus(id: string, isActive: boolean): Promise<Supplier> {
    const { data } = await apiClient.patch<ApiResponse<Supplier>>(`/suppliers/${id}/status`, {
      isActive,
    });
    return data.data;
  },
};
