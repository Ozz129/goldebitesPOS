import { TransferStatus } from './inventory-transfer.interface';

export interface CreateTransferData {
  businessId: string;
  fromBranchId: string;
  toBranchId: string;
  fromLocationId?: string;
  toLocationId?: string;
  notes?: string;
}

export interface TransferItemInput {
  inventoryItemId: string;
  quantity: number;
}

export interface TransferQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: TransferStatus;
  branchId?: string;
}
