import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loyaltyApi } from '../api/loyalty.api';
import { loyaltyKeys } from '../api/loyalty.keys';

export function useSetRewardStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      loyaltyApi.setRewardStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.rewards.lists() });
    },
  });
}
