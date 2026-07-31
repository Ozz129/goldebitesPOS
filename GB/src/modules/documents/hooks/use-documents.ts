import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '../api/documents.api';
import { documentKeys } from '../api/documents.keys';
import type { DocumentFilters } from '../types/document.types';

export function useDocuments(filters: DocumentFilters = {}) {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: () => documentsApi.getDocuments(filters),
    staleTime: 30_000,
  });
}
