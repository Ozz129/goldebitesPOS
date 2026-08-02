export interface CreateInventoryItemData {
  businessId: string;
  categoryId?: string;
  name: string;
  sku?: string;
  unit: string;
  minimumStock?: number;
  currentCost?: number;
  serialNumber?: string;
  brand?: string;
  model?: string;
}

export interface UpdateInventoryItemData {
  categoryId?: string;
  name?: string;
  sku?: string;
  unit?: string;
  minimumStock?: number;
  currentCost?: number;
  serialNumber?: string;
  brand?: string;
  model?: string;
}

export interface InventoryItemQuery {
  businessId: string;
  page: number;
  limit: number;
  categoryId?: string;
  isActive?: boolean;
  search?: string;
}
