import { useQuery } from '@tanstack/react-query';
import { inventoryItemCategoriesApi } from '../api/inventory-item-categories.api';
import { inventoryItemCategoryKeys } from '../api/inventory-item-categories.keys';
import type { InventoryItemCategoryFilters } from '../types/inventory-item-category.types';

export function useInventoryItemCategories(filters: InventoryItemCategoryFilters = {}) {
  return useQuery({
    queryKey: inventoryItemCategoryKeys.list(filters),
    queryFn: () => inventoryItemCategoriesApi.getCategories(filters),
    staleTime: 60_000,
  });
}
