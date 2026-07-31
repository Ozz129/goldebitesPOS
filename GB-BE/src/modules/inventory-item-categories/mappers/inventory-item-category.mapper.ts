import {
  InventoryItemCategory,
  InventoryItemCategoryRow,
} from '../domain/inventory-item-category.interface';

export class InventoryItemCategoryMapper {
  static toDomain(row: InventoryItemCategoryRow): InventoryItemCategory {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      description: row.description,
      displayOrder: row.display_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
