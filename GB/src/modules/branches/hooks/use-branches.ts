import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '../api/branches.api';
import type { BranchFilters } from '../types/branch.types';

export function useBranches(filters: BranchFilters = {}) {
  return useQuery({
    queryKey: ['branches', 'list', filters],
    queryFn: () => branchesApi.getBranches(filters),
    staleTime: 60_000,
  });
}
