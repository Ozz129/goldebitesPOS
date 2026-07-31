import { Product, ProductRow } from '../domain/product.interface';

export class ProductMapper {
  static toDomain(row: ProductRow): Product {
    return {
      id: row.id,
      businessId: row.business_id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      sku: row.sku,
      salePrice: parseFloat(row.sale_price),
      currentCost: parseFloat(row.current_cost),
      imageUrl: row.image_url,
      isActive: row.is_active,
      trackInventory: row.track_inventory,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
