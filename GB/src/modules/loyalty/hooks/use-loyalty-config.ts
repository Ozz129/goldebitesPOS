import { useQuery } from '@tanstack/react-query';
import { loyaltyApi } from '../api/loyalty.api';
import { loyaltyKeys } from '../api/loyalty.keys';

export function useLoyaltyConfig() {
  return useQuery({
    queryKey: loyaltyKeys.config,
    queryFn: () => loyaltyApi.getConfig(),
    staleTime: 60_000,
  });
}
