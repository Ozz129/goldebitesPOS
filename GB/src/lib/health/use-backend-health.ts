import { useQuery } from '@tanstack/react-query';
import { healthApi } from './health.api';

export function useBackendHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthApi.check,
    retry: false,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
