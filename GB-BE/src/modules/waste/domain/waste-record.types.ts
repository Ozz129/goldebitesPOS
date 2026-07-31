export interface CreateWasteRecordData {
  businessId: string;
  branchId: string;
  inventoryItemId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface WasteRecordQuery {
  businessId: string;
  page: number;
  limit: number;
  branchId?: string;
  inventoryItemId?: string;
  dateFrom?: string;
  dateTo?: string;
}
