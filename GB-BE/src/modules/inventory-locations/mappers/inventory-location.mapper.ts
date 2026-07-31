import {
  InventoryLocation,
  InventoryLocationRow,
} from '../domain/inventory-location.interface';

export class InventoryLocationMapper {
  static toDomain(row: InventoryLocationRow): InventoryLocation {
    return {
      id: row.id,
      branchId: row.branch_id,
      name: row.name,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }
}
