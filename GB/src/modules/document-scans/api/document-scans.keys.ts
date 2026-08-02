import type { DocumentScanFilters } from '../types/document-scan.types';

export const documentScanKeys = {
  all: ['document-scans'] as const,
  lists: () => [...documentScanKeys.all, 'list'] as const,
  list: (filters: DocumentScanFilters) => [...documentScanKeys.lists(), filters] as const,
};
