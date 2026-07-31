import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loyaltyApi } from '../api/loyalty.api';
import { loyaltyKeys } from '../api/loyalty.keys';
import type { UpdateRewardPayload } from '../types/loyalty.types';

export function useUpdateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRewardPayload }) =>
      loyaltyApi.updateReward(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.rewards.lists() });
    },
  });
}
