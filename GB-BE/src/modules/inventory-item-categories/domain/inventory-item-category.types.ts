export interface CreateInventoryItemCategoryData {
  businessId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateInventoryItemCategoryData {
  name?: string;
  description?: string;
  displayOrder?: number;
}

export interface InventoryItemCategoryQuery {
  businessId: string;
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}
