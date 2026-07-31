import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistTemplatesApi } from '../api/checklists.api';
import { checklistTemplateKeys } from '../api/checklists.keys';
import type { CreateChecklistTemplatePayload } from '../types/checklist.types';

export function useCreateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChecklistTemplatePayload) => checklistTemplatesApi.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistTemplateKeys.lists() });
    },
  });
}
