export interface CreateProductData {
  businessId: string;
  categoryId?: string;
  name: string;
  description?: string;
  sku?: string;
  salePrice?: number;
  imageUrl?: string;
  trackInventory?: boolean;
}

export interface UpdateProductData {
  categoryId?: string;
  name?: string;
  description?: string;
  sku?: string;
  salePrice?: number;
  imageUrl?: string;
  trackInventory?: boolean;
}

export interface ProductQuery {
  businessId: string;
  page: number;
  limit: number;
  categoryId?: string;
  isActive?: boolean;
  search?: string;
}
