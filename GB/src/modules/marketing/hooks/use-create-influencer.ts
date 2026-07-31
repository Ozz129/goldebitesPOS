import { useMutation, useQueryClient } from '@tanstack/react-query';
import { influencersApi } from '../api/marketing.api';
import { influencerKeys } from '../api/marketing.keys';
import type { CreateInfluencerPayload } from '../types/marketing.types';

export function useCreateInfluencer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInfluencerPayload) => influencersApi.createInfluencer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: influencerKeys.lists() });
    },
  });
}
