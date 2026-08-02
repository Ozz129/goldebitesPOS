import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentScansApi } from '../api/document-scans.api';
import { documentScanKeys } from '../api/document-scans.keys';
import type { CreateDocumentScanPayload } from '../types/document-scan.types';

export function useCreateDocumentScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDocumentScanPayload) => documentScansApi.createDocumentScan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentScanKeys.lists() });
    },
  });
}
