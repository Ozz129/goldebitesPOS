import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentScansApi } from '../api/document-scans.api';
import { documentScanKeys } from '../api/document-scans.keys';

/** Backend performs a soft delete and removes the physical file (DELETE /document-scans/:id). */
export function useDeleteDocumentScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentScansApi.deleteDocumentScan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentScanKeys.lists() });
    },
  });
}
