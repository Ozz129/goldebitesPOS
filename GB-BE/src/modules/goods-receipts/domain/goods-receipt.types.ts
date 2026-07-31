export interface GoodsReceiptItemInput {
  purchaseOrderItemId: string;
  quantityReceived: number;
  unitCost: number;
}

export interface CreateGoodsReceiptData {
  businessId: string;
  branchId: string;
  purchaseOrderId: string;
  notes?: string;
}

export interface GoodsReceiptQuery {
  businessId: string;
  page: number;
  limit: number;
  purchaseOrderId?: string;
}
