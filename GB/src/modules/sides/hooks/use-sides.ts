import { useQuery } from '@tanstack/react-query';
import { sidesApi } from '../api/sides.api';
import { sideKeys } from '../api/sides.keys';
import type { SideFilters } from '../types/side.types';

export function useSides(filters: SideFilters = {}) {
  return useQuery({
    queryKey: sideKeys.list(filters),
    queryFn: () => sidesApi.getSides(filters),
    staleTime: 30_000,
  });
}
