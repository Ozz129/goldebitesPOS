import { useQuery } from '@tanstack/react-query';
import { contentItemsApi } from '../api/marketing.api';
import { contentItemKeys } from '../api/marketing.keys';
import type { ContentItemFilters } from '../types/marketing.types';

export function useContentItems(filters: ContentItemFilters = {}) {
  return useQuery({
    queryKey: contentItemKeys.list(filters),
    queryFn: () => contentItemsApi.getContentItems(filters),
    staleTime: 30_000,
  });
}
