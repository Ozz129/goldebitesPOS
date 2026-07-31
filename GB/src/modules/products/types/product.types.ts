/** Mirrors GB-BE's Product domain object (src/modules/products/domain/product.interface.ts). */
export interface Product {
  id: string;
  businessId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  salePrice: number;
  currentCost: number;
  imageUrl: string | null;
  isActive: boolean;
  trackInventory: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  categoryId?: string;
  description?: string;
  sku?: string;
  salePrice?: number;
  imageUrl?: string;
  trackInventory?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  isActive?: boolean;
  search?: string;
}
