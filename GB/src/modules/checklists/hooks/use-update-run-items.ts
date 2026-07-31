import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistRunsApi } from '../api/checklists.api';
import { checklistRunKeys } from '../api/checklists.keys';
import type { ItemResultInput } from '../types/checklist.types';

export function useUpdateRunItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: ItemResultInput[] }) =>
      checklistRunsApi.updateItems(id, items),
    onSuccess: (run) => {
      queryClient.setQueryData(checklistRunKeys.detail(run.id), run);
    },
  });
}
