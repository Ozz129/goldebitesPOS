import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loyaltyApi } from '../api/loyalty.api';
import { loyaltyKeys } from '../api/loyalty.keys';
import { customerKeys } from '../../customers/api/customers.keys';
import type { RedeemRewardPayload } from '../types/loyalty.types';

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RedeemRewardPayload) => loyaltyApi.redeem(payload),
    onSuccess: (_movement, variables) => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.movements.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customerId) });
    },
  });
}
