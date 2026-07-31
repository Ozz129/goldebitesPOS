import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { inventoryKeys } from '../api/inventory.keys';
import type { StockFilters } from '../types/inventory.types';

export function useStock(filters: StockFilters = {}) {
  return useQuery({
    queryKey: inventoryKeys.stock(filters),
    queryFn: () => inventoryApi.getStock(filters),
    staleTime: 15_000,
  });
}
