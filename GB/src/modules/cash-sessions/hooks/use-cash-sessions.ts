import { useQuery } from '@tanstack/react-query';
import { cashSessionsApi } from '../api/cash-sessions.api';
import { cashSessionKeys } from '../api/cash-sessions.keys';
import type { CashSessionFilters } from '../types/cash-session.types';

export function useCashSessions(filters: CashSessionFilters = {}) {
  return useQuery({
    queryKey: cashSessionKeys.list(filters),
    queryFn: () => cashSessionsApi.getSessions(filters),
    staleTime: 30_000,
  });
}
