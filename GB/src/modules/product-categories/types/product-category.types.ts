export interface ProductCategory {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductCategoryPayload {
  name: string;
  description?: string;
  displayOrder?: number;
}

export type UpdateProductCategoryPayload = Partial<CreateProductCategoryPayload>;

export interface ProductCategoryFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}
