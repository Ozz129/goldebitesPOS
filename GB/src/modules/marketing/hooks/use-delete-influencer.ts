import { useMutation, useQueryClient } from '@tanstack/react-query';
import { influencersApi } from '../api/marketing.api';
import { influencerKeys } from '../api/marketing.keys';

/** Backend performs a soft delete (DELETE /marketing-influencers/:id). */
export function useDeleteInfluencer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => influencersApi.deleteInfluencer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: influencerKeys.lists() });
    },
  });
}
