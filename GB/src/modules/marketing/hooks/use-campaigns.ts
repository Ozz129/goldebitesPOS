import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '../api/marketing.api';
import { campaignKeys } from '../api/marketing.keys';
import type { CampaignFilters } from '../types/marketing.types';

export function useCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: () => campaignsApi.getCampaigns(filters),
    staleTime: 30_000,
  });
}
