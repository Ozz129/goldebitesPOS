import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistTemplatesApi } from '../api/checklists.api';
import { checklistTemplateKeys } from '../api/checklists.keys';
import type { UpdateChecklistTemplatePayload } from '../types/checklist.types';

export function useUpdateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateChecklistTemplatePayload }) =>
      checklistTemplatesApi.updateTemplate(id, payload),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: checklistTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: checklistTemplateKeys.detail(template.id) });
    },
  });
}
