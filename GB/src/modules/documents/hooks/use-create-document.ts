import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documents.api';
import { documentKeys } from '../api/documents.keys';
import type { CreateDocumentPayload } from '../types/document.types';

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) => documentsApi.createDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
