import {
  InventoryCount,
  InventoryCountItem,
  InventoryCountItemRow,
  InventoryCountRow,
} from '../domain/inventory-count.interface';

export class InventoryCountMapper {
  static toDomain(row: InventoryCountRow): InventoryCount {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      locationId: row.location_id,
      status: row.status,
      startedBy: row.started_by,
      startedAt: row.started_at,
      completedBy: row.completed_by,
      completedAt: row.completed_at,
      notes: row.notes,
    };
  }

  static itemToDomain(row: InventoryCountItemRow): InventoryCountItem {
    const expected = parseFloat(row.expected_quantity);
    const counted =
      row.counted_quantity === null ? null : parseFloat(row.counted_quantity);
    return {
      id: row.id,
      countId: row.count_id,
      inventoryItemId: row.inventory_item_id,
      inventoryItemName: row.inventory_item_name,
      unit: row.unit,
      expectedQuantity: expected,
      countedQuantity: counted,
      countedAt: row.counted_at,
      difference:
        counted === null
          ? null
          : Math.round((counted - expected) * 1000) / 1000,
    };
  }
}
