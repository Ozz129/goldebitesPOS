import type { OrderItem } from '../../modules/orders/types/order.types';
import type { Product } from '../../modules/products/types/product.types';
import type { ProductCategory } from '../../modules/product-categories/types/product-category.types';
import type { InventoryItem, InventoryMovement } from '../../modules/inventory/types/inventory.types';
import type { WasteRecord } from '../../modules/waste/types/waste-record.types';

export function salesByCategory(
  itemsByOrder: OrderItem[][],
  products: Product[],
  categories: ProductCategory[],
): { category: string; value: number }[] {
  const productById = new Map(products.map((p) => [p.id, p]));
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const buckets = new Map<string, number>();
  for (const items of itemsByOrder) {
    for (const item of items) {
      const categoryId = item.productId ? (productById.get(item.productId)?.categoryId ?? null) : null;
      const label = (categoryId && categoryNameById.get(categoryId)) || 'Sin categoría';
      buckets.set(label, (buckets.get(label) ?? 0) + item.totalPrice);
    }
  }
  return Array.from(buckets.entries()).map(([category, value]) => ({ category, value }));
}

export function marginByProduct(products: Product[], limit = 8): { name: string; margin: number }[] {
  return products
    .filter((p) => p.salePrice > 0)
    .map((p) => ({ name: p.name, margin: ((p.salePrice - p.currentCost) / p.salePrice) * 100 }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, limit);
}

export function inventoryRotation(
  movements: InventoryMovement[],
  inventoryItems: InventoryItem[],
  limit = 6,
): { name: string; movimientos: number }[] {
  const itemById = new Map(inventoryItems.map((i) => [i.id, i]));
  const buckets = new Map<string, number>();
  for (const m of movements) {
    buckets.set(m.inventoryItemId, (buckets.get(m.inventoryItemId) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .map(([itemId, count]) => ({ name: itemById.get(itemId)?.name ?? itemId, movimientos: count }))
    .sort((a, b) => b.movimientos - a.movimientos)
    .slice(0, limit);
}

export function wasteByReason(records: WasteRecord[]): { reason: string; value: number }[] {
  const buckets = new Map<string, number>();
  for (const record of records) {
    const value = (record.unitCost ?? 0) * record.quantity;
    buckets.set(record.reason, (buckets.get(record.reason) ?? 0) + value);
  }
  return Array.from(buckets.entries()).map(([reason, value]) => ({ reason, value }));
}
