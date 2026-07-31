import { useQuery } from '@tanstack/react-query';
import { loyaltyApi } from '../api/loyalty.api';
import { loyaltyKeys } from '../api/loyalty.keys';
import type { MovementFilters } from '../types/loyalty.types';

export function useLoyaltyMovements(filters: MovementFilters = {}) {
  return useQuery({
    queryKey: loyaltyKeys.movements.list(filters),
    queryFn: () => loyaltyApi.getMovements(filters),
    staleTime: 15_000,
  });
}
