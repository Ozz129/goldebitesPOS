export interface CreateInventoryItemData {
  businessId: string;
  categoryId?: string;
  name: string;
  sku?: string;
  unit: string;
  minimumStock?: number;
  currentCost?: number;
}

export interface UpdateInventoryItemData {
  categoryId?: string;
  name?: string;
  sku?: string;
  unit?: string;
  minimumStock?: number;
  currentCost?: number;
}

export interface InventoryItemQuery {
  businessId: string;
  page: number;
  limit: number;
  categoryId?: string;
  isActive?: boolean;
  search?: string;
}
