import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../api/marketing.api';
import { campaignKeys } from '../api/marketing.keys';

/** Backend performs a soft delete (DELETE /marketing-campaigns/:id). */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}
