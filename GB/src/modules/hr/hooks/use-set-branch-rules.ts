import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '../api/hr.api';
import { hrKeys } from '../api/hr.keys';
import type { BranchRuleInput } from '../types/hr.types';

export function useSetBranchRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, rules }: { branchId: string; rules: BranchRuleInput[] }) =>
      hrApi.setBranchRules(branchId, rules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.all });
    },
  });
}
