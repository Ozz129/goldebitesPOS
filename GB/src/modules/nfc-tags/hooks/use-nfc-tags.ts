import { useQuery } from '@tanstack/react-query';
import { nfcTagsApi } from '../api/nfc-tags.api';
import { nfcTagsKeys } from '../api/nfc-tags.keys';

export function useNfcTags(branchId: string | null | undefined) {
  return useQuery({
    queryKey: nfcTagsKeys.byBranch(branchId ?? ''),
    queryFn: () => nfcTagsApi.getByBranch(branchId as string),
    enabled: Boolean(branchId),
    staleTime: 30_000,
  });
}
