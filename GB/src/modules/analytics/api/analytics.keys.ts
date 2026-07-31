import type { AnalyticsRangeFilters, TopProductsFilters } from '../types/analytics.types';

export const analyticsKeys = {
  all: ['analytics'] as const,
  sales: (filters: AnalyticsRangeFilters) => [...analyticsKeys.all, 'sales', filters] as const,
  topProducts: (filters: TopProductsFilters) => [...analyticsKeys.all, 'top-products', filters] as const,
};
