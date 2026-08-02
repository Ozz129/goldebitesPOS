import { useQuery } from '@tanstack/react-query';
import { documentScansApi } from '../api/document-scans.api';
import { documentScanKeys } from '../api/document-scans.keys';
import type { DocumentScanFilters } from '../types/document-scan.types';

export function useDocumentScans(filters: DocumentScanFilters = {}) {
  return useQuery({
    queryKey: documentScanKeys.list(filters),
    queryFn: () => documentScansApi.getDocumentScans(filters),
    staleTime: 30_000,
  });
}
