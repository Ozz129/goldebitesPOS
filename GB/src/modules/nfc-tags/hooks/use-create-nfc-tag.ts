import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nfcTagsApi } from '../api/nfc-tags.api';
import { nfcTagsKeys } from '../api/nfc-tags.keys';
import type { CreateNfcTagPayload } from '../types/nfc-tag.types';

export function useCreateNfcTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNfcTagPayload) => nfcTagsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nfcTagsKeys.all });
    },
  });
}
