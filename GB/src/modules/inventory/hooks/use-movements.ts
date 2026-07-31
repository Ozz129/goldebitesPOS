import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { inventoryKeys } from '../api/inventory.keys';
import type { MovementFilters } from '../types/inventory.types';

export function useMovements(filters: MovementFilters = {}) {
  return useQuery({
    queryKey: inventoryKeys.movements(filters),
    queryFn: () => inventoryApi.getMovements(filters),
    staleTime: 15_000,
  });
}
