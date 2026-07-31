import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loyaltyApi } from '../api/loyalty.api';
import { loyaltyKeys } from '../api/loyalty.keys';

/** Backend performs a soft delete (DELETE /loyalty-rewards/:id). */
export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => loyaltyApi.deleteReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.rewards.lists() });
    },
  });
}
