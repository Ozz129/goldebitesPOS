export interface WasteRecord {
  id: string;
  businessId: string;
  branchId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unitCost: number | null;
  reason: string;
  notes: string | null;
  recordedBy: string | null;
  createdAt: Date;
}

export interface WasteRecordRow {
  id: string;
  business_id: string;
  branch_id: string;
  inventory_item_id: string;
  inventory_item_name: string;
  quantity: string;
  unit_cost: string | null;
  reason: string;
  notes: string | null;
  recorded_by: string | null;
  created_at: Date;
}
