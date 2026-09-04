import { useQuery } from '@tanstack/react-query';
import { saucesApi } from '../api/sauces.api';
import { sauceKeys } from '../api/sauces.keys';
import type { SauceFilters } from '../types/sauce.types';

export function useSauces(filters: SauceFilters = {}) {
  return useQuery({
    queryKey: sauceKeys.list(filters),
    queryFn: () => saucesApi.getSauces(filters),
    staleTime: 30_000,
  });
}
