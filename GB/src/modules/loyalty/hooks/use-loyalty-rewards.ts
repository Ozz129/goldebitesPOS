import { useQuery } from '@tanstack/react-query';
import { loyaltyApi } from '../api/loyalty.api';
import { loyaltyKeys } from '../api/loyalty.keys';
import type { RewardFilters } from '../types/loyalty.types';

export function useLoyaltyRewards(filters: RewardFilters = {}) {
  return useQuery({
    queryKey: loyaltyKeys.rewards.list(filters),
    queryFn: () => loyaltyApi.getRewards(filters),
    staleTime: 30_000,
  });
}
