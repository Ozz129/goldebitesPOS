import { DbClient } from '../../../database/types/database.types';
import {
  CountStatus,
  InventoryCountItemRow,
  InventoryCountRow,
} from '../domain/inventory-count.interface';
import { CountQuery, StartCountData } from '../domain/inventory-count.types';

export interface IInventoryCountsRepository {
  create(data: StartCountData, client?: DbClient): Promise<InventoryCountRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<InventoryCountRow | null>;
  findAll(
    query: CountQuery,
  ): Promise<{ rows: InventoryCountRow[]; total: number }>;
  addItems(
    countId: string,
    items: { inventoryItemId: string; expectedQuantity: number }[],
    client?: DbClient,
  ): Promise<void>;
  findItems(
    countId: string,
    client?: DbClient,
  ): Promise<InventoryCountItemRow[]>;
  findItem(
    countId: string,
    inventoryItemId: string,
    client?: DbClient,
  ): Promise<InventoryCountItemRow | null>;
  recordCountedQuantity(
    countId: string,
    inventoryItemId: string,
    countedQuantity: number,
    client?: DbClient,
  ): Promise<void>;
  setStatus(
    id: string,
    businessId: string,
    status: CountStatus,
    completedBy: string | undefined,
    client?: DbClient,
  ): Promise<InventoryCountRow | null>;
}

export const INVENTORY_COUNTS_REPOSITORY = Symbol(
  'INVENTORY_COUNTS_REPOSITORY',
);
