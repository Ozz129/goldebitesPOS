import { PurchaseOrderStatus } from './purchase-order.interface';

export interface CreatePurchaseOrderData {
  businessId: string;
  branchId: string;
  supplierId: string;
  expectedDate?: string;
  notes?: string;
}

export interface PurchaseOrderItemInput {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrderQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: PurchaseOrderStatus;
  branchId?: string;
  supplierId?: string;
}
