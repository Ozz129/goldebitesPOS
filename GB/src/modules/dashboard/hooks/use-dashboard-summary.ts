import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboardSummary(branchId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'summary', branchId ?? 'all'],
    queryFn: () => dashboardApi.getSummary(branchId),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
