export interface InventoryItem {
  id: string;
  businessId: string;
  categoryId: string | null;
  name: string;
  sku: string | null;
  unit: string;
  minimumStock: number;
  currentCost: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemRow {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  unit: string;
  minimum_stock: string;
  current_cost: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
