import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nfcTagsApi } from '../api/nfc-tags.api';
import { nfcTagsKeys } from '../api/nfc-tags.keys';
import type { UpdateNfcTagPayload } from '../types/nfc-tag.types';

export function useUpdateNfcTag(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNfcTagPayload) => nfcTagsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nfcTagsKeys.all });
    },
  });
}
