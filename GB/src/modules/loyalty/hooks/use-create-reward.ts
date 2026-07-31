import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loyaltyApi } from '../api/loyalty.api';
import { loyaltyKeys } from '../api/loyalty.keys';
import type { CreateRewardPayload } from '../types/loyalty.types';

export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRewardPayload) => loyaltyApi.createReward(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.rewards.lists() });
    },
  });
}
