import { WasteRecord, WasteRecordRow } from '../domain/waste-record.interface';

export class WasteRecordMapper {
  static toDomain(row: WasteRecordRow): WasteRecord {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      inventoryItemId: row.inventory_item_id,
      inventoryItemName: row.inventory_item_name,
      quantity: parseFloat(row.quantity),
      unitCost: row.unit_cost === null ? null : parseFloat(row.unit_cost),
      reason: row.reason,
      notes: row.notes,
      recordedBy: row.recorded_by,
      createdAt: row.created_at,
    };
  }
}
