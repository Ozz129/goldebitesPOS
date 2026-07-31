import { DbClient } from '../../../database/types/database.types';
import {
  InventoryTransferItemRow,
  InventoryTransferRow,
} from '../domain/inventory-transfer.interface';
import {
  CreateTransferData,
  TransferItemInput,
  TransferQuery,
} from '../domain/inventory-transfer.types';
import { TransferStatus } from '../domain/inventory-transfer.interface';

export interface IInventoryTransfersRepository {
  create(
    data: CreateTransferData,
    requestedBy: string | undefined,
    client?: DbClient,
  ): Promise<InventoryTransferRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<InventoryTransferRow | null>;
  findAll(
    query: TransferQuery,
  ): Promise<{ rows: InventoryTransferRow[]; total: number }>;
  addItems(
    transferId: string,
    items: TransferItemInput[],
    client?: DbClient,
  ): Promise<void>;
  findItems(
    transferId: string,
    client?: DbClient,
  ): Promise<InventoryTransferItemRow[]>;
  setStatus(
    id: string,
    businessId: string,
    status: TransferStatus,
    completedBy: string | undefined,
    client?: DbClient,
  ): Promise<InventoryTransferRow | null>;
}

export const INVENTORY_TRANSFERS_REPOSITORY = Symbol(
  'INVENTORY_TRANSFERS_REPOSITORY',
);
