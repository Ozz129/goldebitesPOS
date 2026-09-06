import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '../api/branches.api';
import { branchesKeys } from '../api/branches.keys';

export function useBranch(id: string | null | undefined) {
  return useQuery({
    queryKey: branchesKeys.detail(id ?? ''),
    queryFn: () => branchesApi.getBranch(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
