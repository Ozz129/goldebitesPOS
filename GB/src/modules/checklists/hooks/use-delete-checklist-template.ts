import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistTemplatesApi } from '../api/checklists.api';
import { checklistTemplateKeys } from '../api/checklists.keys';

/** Backend performs a soft delete (DELETE /checklist-templates/:id). */
export function useDeleteChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistTemplatesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistTemplateKeys.lists() });
    },
  });
}
