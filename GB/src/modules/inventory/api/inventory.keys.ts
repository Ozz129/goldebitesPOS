import type { InventoryItemFilters, MovementFilters, StockFilters } from '../types/inventory.types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  items: () => [...inventoryKeys.all, 'items'] as const,
  itemList: (filters: InventoryItemFilters) => [...inventoryKeys.items(), 'list', filters] as const,
  itemDetail: (id: string) => [...inventoryKeys.items(), 'detail', id] as const,
  stock: (filters: StockFilters) => [...inventoryKeys.all, 'stock', filters] as const,
  lowStock: (branchId?: string) => [...inventoryKeys.all, 'low-stock', branchId ?? 'all'] as const,
  movements: (filters: MovementFilters) => [...inventoryKeys.all, 'movements', filters] as const,
};
