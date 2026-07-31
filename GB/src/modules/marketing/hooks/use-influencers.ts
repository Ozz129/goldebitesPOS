import { useQuery } from '@tanstack/react-query';
import { influencersApi } from '../api/marketing.api';
import { influencerKeys } from '../api/marketing.keys';
import type { InfluencerFilters } from '../types/marketing.types';

export function useInfluencers(filters: InfluencerFilters = {}) {
  return useQuery({
    queryKey: influencerKeys.list(filters),
    queryFn: () => influencersApi.getInfluencers(filters),
    staleTime: 30_000,
  });
}
