export interface InventoryItemCategory {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemCategoryPayload {
  name: string;
  description?: string;
  displayOrder?: number;
}

export type UpdateInventoryItemCategoryPayload = Partial<CreateInventoryItemCategoryPayload>;

export interface InventoryItemCategoryFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}
