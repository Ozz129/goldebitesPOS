export enum TransferStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface InventoryTransfer {
  id: string;
  businessId: string;
  fromBranchId: string;
  toBranchId: string;
  fromLocationId: string | null;
  toLocationId: string | null;
  status: TransferStatus;
  requestedBy: string | null;
  completedBy: string | null;
  createdAt: Date;
  completedAt: Date | null;
  notes: string | null;
}

export interface InventoryTransferRow {
  id: string;
  business_id: string;
  from_branch_id: string;
  to_branch_id: string;
  from_location_id: string | null;
  to_location_id: string | null;
  status: TransferStatus;
  requested_by: string | null;
  completed_by: string | null;
  created_at: Date;
  completed_at: Date | null;
  notes: string | null;
}

export interface InventoryTransferItem {
  id: string;
  transferId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
}

export interface InventoryTransferItemRow {
  id: string;
  transfer_id: string;
  inventory_item_id: string;
  inventory_item_name: string;
  quantity: string;
}

export interface InventoryTransferWithItems extends InventoryTransfer {
  items: InventoryTransferItem[];
}
