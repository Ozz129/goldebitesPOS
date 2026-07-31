import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contentItemsApi } from '../api/marketing.api';
import { contentItemKeys } from '../api/marketing.keys';
import type { UpdateContentItemPayload } from '../types/marketing.types';

export function useUpdateContentItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContentItemPayload }) =>
      contentItemsApi.updateContentItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentItemKeys.lists() });
    },
  });
}
