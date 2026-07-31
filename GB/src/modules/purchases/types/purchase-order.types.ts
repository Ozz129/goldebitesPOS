export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  businessId: string;
  branchId: string;
  supplierId: string;
  orderNumber: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDate: string | null;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderWithItems extends PurchaseOrder {
  items: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderItemPayload {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderPayload {
  branchId: string;
  supplierId: string;
  expectedDate?: string;
  notes?: string;
  items: CreatePurchaseOrderItemPayload[];
}

export interface PurchaseOrderFilters {
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  branchId?: string;
  supplierId?: string;
}
