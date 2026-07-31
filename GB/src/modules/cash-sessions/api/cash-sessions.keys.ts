import type { CashSessionFilters } from '../types/cash-session.types';

export const cashSessionKeys = {
  all: ['cash-sessions'] as const,
  lists: () => [...cashSessionKeys.all, 'list'] as const,
  list: (filters: CashSessionFilters) => [...cashSessionKeys.lists(), filters] as const,
  details: () => [...cashSessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...cashSessionKeys.details(), id] as const,
  current: (branchId: string) => [...cashSessionKeys.all, 'current', branchId] as const,
};
