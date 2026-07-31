import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documents.api';
import { documentKeys } from '../api/documents.keys';

/** Backend performs a soft delete (DELETE /compliance-documents/:id). */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
