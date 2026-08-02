import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentScansApi } from '../api/document-scans.api';
import { documentScanKeys } from '../api/document-scans.keys';
import type { UpdateDocumentScanPayload } from '../types/document-scan.types';

export function useUpdateDocumentScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocumentScanPayload }) =>
      documentScansApi.updateDocumentScan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentScanKeys.lists() });
    },
  });
}
