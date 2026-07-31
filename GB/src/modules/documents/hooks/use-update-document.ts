import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documents.api';
import { documentKeys } from '../api/documents.keys';
import type { UpdateDocumentPayload } from '../types/document.types';

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocumentPayload }) =>
      documentsApi.updateDocument(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
