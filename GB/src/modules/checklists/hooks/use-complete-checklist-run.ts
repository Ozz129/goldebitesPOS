import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistRunsApi } from '../api/checklists.api';
import { checklistRunKeys } from '../api/checklists.keys';

export function useCompleteChecklistRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, observations }: { id: string; observations?: string }) =>
      checklistRunsApi.completeRun(id, observations),
    onSuccess: (run) => {
      queryClient.setQueryData(checklistRunKeys.detail(run.id), run);
      queryClient.invalidateQueries({ queryKey: checklistRunKeys.lists() });
    },
  });
}
