import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contentItemsApi } from '../api/marketing.api';
import { contentItemKeys } from '../api/marketing.keys';
import type { CreateContentItemPayload } from '../types/marketing.types';

export function useCreateContentItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContentItemPayload) => contentItemsApi.createContentItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentItemKeys.lists() });
    },
  });
}
