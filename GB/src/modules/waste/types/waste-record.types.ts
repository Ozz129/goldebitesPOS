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
  createdAt: string;
}

export interface CreateWasteRecordPayload {
  branchId: string;
  inventoryItemId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface WasteRecordFilters {
  page?: number;
  limit?: number;
  branchId?: string;
  inventoryItemId?: string;
  dateFrom?: string;
  dateTo?: string;
}
