import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';
import { analyticsKeys } from '../api/analytics.keys';
import type { TopProductsFilters } from '../types/analytics.types';

export function useTopProducts(filters: TopProductsFilters) {
  return useQuery({
    queryKey: analyticsKeys.topProducts(filters),
    queryFn: () => analyticsApi.getTopProducts(filters),
    staleTime: 60_000,
  });
}
