export enum InventoryMovementType {
  PURCHASE = 'PURCHASE',
  SALE_CONSUMPTION = 'SALE_CONSUMPTION',
  WASTE = 'WASTE',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  RETURN = 'RETURN',
  INITIAL_STOCK = 'INITIAL_STOCK',
}

/** Movement types that subtract from stock; every other type adds to it. */
export const OUTBOUND_MOVEMENT_TYPES: ReadonlySet<InventoryMovementType> =
  new Set([
    InventoryMovementType.SALE_CONSUMPTION,
    InventoryMovementType.WASTE,
    InventoryMovementType.ADJUSTMENT_OUT,
    InventoryMovementType.TRANSFER_OUT,
  ]);

export interface RecordMovementData {
  businessId: string;
  branchId: string;
  locationId?: string | null;
  inventoryItemId: string;
  movementType: InventoryMovementType;
  quantity: number;
  unitCost?: number | null;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdBy?: string;
}

export interface MovementQuery {
  businessId: string;
  page: number;
  limit: number;
  branchId?: string;
  inventoryItemId?: string;
  movementType?: InventoryMovementType;
  dateFrom?: string;
  dateTo?: string;
}

export interface StockQuery {
  businessId: string;
  branchId?: string;
  locationId?: string;
  inventoryItemId?: string;
}
