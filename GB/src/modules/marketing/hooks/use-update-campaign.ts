import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../api/marketing.api';
import { campaignKeys } from '../api/marketing.keys';
import type { UpdateCampaignPayload } from '../types/marketing.types';

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCampaignPayload }) =>
      campaignsApi.updateCampaign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}
