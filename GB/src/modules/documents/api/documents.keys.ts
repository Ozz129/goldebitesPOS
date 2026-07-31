import type { DocumentFilters } from '../types/document.types';

export const documentKeys = {
  all: ['compliance-documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: DocumentFilters) => [...documentKeys.lists(), filters] as const,
};
