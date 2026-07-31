import type { InventoryItemCategoryFilters } from '../types/inventory-item-category.types';

export const inventoryItemCategoryKeys = {
  all: ['inventory-item-categories'] as const,
  lists: () => [...inventoryItemCategoryKeys.all, 'list'] as const,
  list: (filters: InventoryItemCategoryFilters) =>
    [...inventoryItemCategoryKeys.lists(), filters] as const,
  details: () => [...inventoryItemCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryItemCategoryKeys.details(), id] as const,
};
