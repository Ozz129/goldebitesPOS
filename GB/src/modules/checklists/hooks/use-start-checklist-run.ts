import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistRunsApi } from '../api/checklists.api';
import { checklistRunKeys } from '../api/checklists.keys';
import type { StartChecklistRunPayload } from '../types/checklist.types';

export function useStartChecklistRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartChecklistRunPayload) => checklistRunsApi.startRun(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistRunKeys.lists() });
    },
  });
}
