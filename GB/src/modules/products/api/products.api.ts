import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateProductPayload,
  Product,
  ProductFilters,
  UpdateProductPayload,
} from '../types/product.types';

export const productsApi = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params: filters,
    });
    return data;
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const { data } = await apiClient.post<ApiResponse<Product>>('/products', payload);
    return data.data;
  },

  async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
    const { data } = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, payload);
    return data.data;
  },

  async setProductStatus(id: string, isActive: boolean): Promise<Product> {
    const { data } = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/status`, {
      isActive,
    });
    return data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
