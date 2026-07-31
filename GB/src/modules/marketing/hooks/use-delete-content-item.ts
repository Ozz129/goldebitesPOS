import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contentItemsApi } from '../api/marketing.api';
import { contentItemKeys } from '../api/marketing.keys';

/** Backend performs a soft delete (DELETE /marketing-content-items/:id). */
export function useDeleteContentItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contentItemsApi.deleteContentItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentItemKeys.lists() });
    },
  });
}
