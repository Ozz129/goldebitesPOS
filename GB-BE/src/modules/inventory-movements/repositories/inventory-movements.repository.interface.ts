import { DbClient } from '../../../database/types/database.types';
import {
  InventoryMovementRow,
  LowStockRow,
  StockRow,
} from '../domain/inventory-movement.interface';
import {
  MovementQuery,
  RecordMovementData,
  StockQuery,
} from '../domain/inventory-movement.types';

export interface IInventoryMovementsRepository {
  create(
    data: RecordMovementData,
    client?: DbClient,
  ): Promise<InventoryMovementRow>;
  findAll(
    query: MovementQuery,
  ): Promise<{ rows: InventoryMovementRow[]; total: number }>;
  getStock(query: StockQuery): Promise<StockRow[]>;
  getStockForItem(
    businessId: string,
    branchId: string,
    inventoryItemId: string,
    client?: DbClient,
  ): Promise<number>;
  getLowStock(businessId: string, branchId?: string): Promise<LowStockRow[]>;
  findByReference(
    referenceType: string,
    referenceId: string,
    client?: DbClient,
  ): Promise<InventoryMovementRow[]>;
}

export const INVENTORY_MOVEMENTS_REPOSITORY = Symbol(
  'INVENTORY_MOVEMENTS_REPOSITORY',
);
