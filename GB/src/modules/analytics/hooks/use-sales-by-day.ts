import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';
import { analyticsKeys } from '../api/analytics.keys';
import type { AnalyticsRangeFilters } from '../types/analytics.types';

export function useSalesByDay(filters: AnalyticsRangeFilters) {
  return useQuery({
    queryKey: analyticsKeys.sales(filters),
    queryFn: () => analyticsApi.getSales(filters),
    staleTime: 60_000,
  });
}
