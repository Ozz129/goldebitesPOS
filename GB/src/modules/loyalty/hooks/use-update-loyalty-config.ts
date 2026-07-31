import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loyaltyApi } from '../api/loyalty.api';
import { loyaltyKeys } from '../api/loyalty.keys';
import type { UpdateLoyaltyConfigPayload } from '../types/loyalty.types';

export function useUpdateLoyaltyConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLoyaltyConfigPayload) => loyaltyApi.updateConfig(payload),
    onSuccess: (config) => {
      queryClient.setQueryData(loyaltyKeys.config, config);
    },
  });
}
