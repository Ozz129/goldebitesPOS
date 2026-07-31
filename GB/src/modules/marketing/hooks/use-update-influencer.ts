import { useMutation, useQueryClient } from '@tanstack/react-query';
import { influencersApi } from '../api/marketing.api';
import { influencerKeys } from '../api/marketing.keys';
import type { UpdateInfluencerPayload } from '../types/marketing.types';

export function useUpdateInfluencer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInfluencerPayload }) =>
      influencersApi.updateInfluencer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: influencerKeys.lists() });
    },
  });
}
