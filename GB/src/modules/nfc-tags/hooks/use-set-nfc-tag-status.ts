import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nfcTagsApi } from '../api/nfc-tags.api';
import { nfcTagsKeys } from '../api/nfc-tags.keys';

export function useSetNfcTagStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isActive: boolean) => nfcTagsApi.setStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nfcTagsKeys.all });
    },
  });
}
