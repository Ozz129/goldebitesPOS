import {
  InventoryQueryResultItem,
  InventoryQueryResultRow,
  InventoryQueryTemplate,
  InventoryQueryTemplateRow,
} from '../domain/inventory-query.types';

export class InventoryQueryResultMapper {
  static toDomain(row: InventoryQueryResultRow): InventoryQueryResultItem {
    return {
      id: row.id,
      categoryId: row.category_id,
      categoryName: row.category_name,
      name: row.name,
      sku: row.sku,
      unit: row.unit,
      minimumStock: parseFloat(row.minimum_stock),
      currentCost: parseFloat(row.current_cost),
      currentStock: parseFloat(row.current_stock),
      serialNumber: row.serial_number,
      brand: row.brand,
      model: row.model,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }
}

export class InventoryQueryTemplateMapper {
  static toDomain(row: InventoryQueryTemplateRow): InventoryQueryTemplate {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      conditions: row.conditions,
      intent: row.intent,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
