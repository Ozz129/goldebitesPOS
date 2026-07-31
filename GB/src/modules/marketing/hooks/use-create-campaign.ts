import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../api/marketing.api';
import { campaignKeys } from '../api/marketing.keys';
import type { CreateCampaignPayload } from '../types/marketing.types';

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => campaignsApi.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}
