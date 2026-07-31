export interface CreateProductCategoryData {
  businessId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateProductCategoryData {
  name?: string;
  description?: string;
  displayOrder?: number;
}

export interface ProductCategoryQuery {
  businessId: string;
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}
