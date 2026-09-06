import { useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '../api/branches.api';
import { branchesKeys } from '../api/branches.keys';
import type { UpdateBranchPayload } from '../types/branch.types';

export function useUpdateBranch(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBranchPayload) => branchesApi.updateBranch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchesKeys.all });
    },
  });
}
