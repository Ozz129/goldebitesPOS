import { useQuery } from '@tanstack/react-query';
import { hrApi } from '../api/hr.api';
import { hrKeys } from '../api/hr.keys';

export function useBranchRules(branchId: string | null | undefined) {
  return useQuery({
    queryKey: hrKeys.branchRules(branchId ?? ''),
    queryFn: () => hrApi.getBranchRules(branchId as string),
    enabled: Boolean(branchId),
    staleTime: 30_000,
  });
}
