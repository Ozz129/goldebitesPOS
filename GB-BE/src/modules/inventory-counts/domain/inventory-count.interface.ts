export enum CountStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface InventoryCount {
  id: string;
  businessId: string;
  branchId: string;
  locationId: string | null;
  status: CountStatus;
  startedBy: string | null;
  startedAt: Date;
  completedBy: string | null;
  completedAt: Date | null;
  notes: string | null;
}

export interface InventoryCountRow {
  id: string;
  business_id: string;
  branch_id: string;
  location_id: string | null;
  status: CountStatus;
  started_by: string | null;
  started_at: Date;
  completed_by: string | null;
  completed_at: Date | null;
  notes: string | null;
}

export interface InventoryCountItem {
  id: string;
  countId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  unit: string;
  expectedQuantity: number;
  countedQuantity: number | null;
  countedAt: Date | null;
  difference: number | null;
}

export interface InventoryCountItemRow {
  id: string;
  count_id: string;
  inventory_item_id: string;
  inventory_item_name: string;
  unit: string;
  expected_quantity: string;
  counted_quantity: string | null;
  counted_at: Date | null;
}

export interface InventoryCountWithItems extends InventoryCount {
  items: InventoryCountItem[];
}
