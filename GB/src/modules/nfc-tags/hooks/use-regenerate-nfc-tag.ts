import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nfcTagsApi } from '../api/nfc-tags.api';
import { nfcTagsKeys } from '../api/nfc-tags.keys';

export function useRegenerateNfcTag(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => nfcTagsApi.regenerateToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nfcTagsKeys.all });
    },
  });
}
