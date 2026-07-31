export interface GoodsReceipt {
  id: string;
  businessId: string;
  branchId: string;
  purchaseOrderId: string;
  receivedBy: string | null;
  receivedAt: Date;
  notes: string | null;
}

export interface GoodsReceiptRow {
  id: string;
  business_id: string;
  branch_id: string;
  purchase_order_id: string;
  received_by: string | null;
  received_at: Date;
  notes: string | null;
}

export interface GoodsReceiptItem {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantityReceived: number;
  unitCost: number;
}

export interface GoodsReceiptItemRow {
  id: string;
  goods_receipt_id: string;
  purchase_order_item_id: string;
  inventory_item_id: string;
  inventory_item_name: string;
  quantity_received: string;
  unit_cost: string;
}

export interface GoodsReceiptWithItems extends GoodsReceipt {
  items: GoodsReceiptItem[];
}
