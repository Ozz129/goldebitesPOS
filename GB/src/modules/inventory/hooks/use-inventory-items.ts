import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { inventoryKeys } from '../api/inventory.keys';
import type { InventoryItemFilters } from '../types/inventory.types';

export function useInventoryItems(filters: InventoryItemFilters = {}) {
  return useQuery({
    queryKey: inventoryKeys.itemList(filters),
    queryFn: () => inventoryApi.getItems(filters),
    staleTime: 30_000,
  });
}
