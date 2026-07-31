export interface GoodsReceiptItem {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantityReceived: number;
  unitCost: number;
}

export interface GoodsReceipt {
  id: string;
  businessId: string;
  branchId: string;
  purchaseOrderId: string;
  receivedBy: string | null;
  receivedAt: string;
  notes: string | null;
}

export interface GoodsReceiptWithItems extends GoodsReceipt {
  items: GoodsReceiptItem[];
}

export interface CreateGoodsReceiptItemPayload {
  purchaseOrderItemId: string;
  quantityReceived: number;
  unitCost: number;
}

export interface CreateGoodsReceiptPayload {
  purchaseOrderId: string;
  notes?: string;
  items: CreateGoodsReceiptItemPayload[];
}
