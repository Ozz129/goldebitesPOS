import {
  InventoryTransfer,
  InventoryTransferItem,
  InventoryTransferItemRow,
  InventoryTransferRow,
} from '../domain/inventory-transfer.interface';

export class InventoryTransferMapper {
  static toDomain(row: InventoryTransferRow): InventoryTransfer {
    return {
      id: row.id,
      businessId: row.business_id,
      fromBranchId: row.from_branch_id,
      toBranchId: row.to_branch_id,
      fromLocationId: row.from_location_id,
      toLocationId: row.to_location_id,
      status: row.status,
      requestedBy: row.requested_by,
      completedBy: row.completed_by,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      notes: row.notes,
    };
  }

  static itemToDomain(row: InventoryTransferItemRow): InventoryTransferItem {
    return {
      id: row.id,
      transferId: row.transfer_id,
      inventoryItemId: row.inventory_item_id,
      inventoryItemName: row.inventory_item_name,
      quantity: parseFloat(row.quantity),
    };
  }
}
