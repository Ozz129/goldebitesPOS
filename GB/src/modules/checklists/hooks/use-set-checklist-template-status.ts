import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistTemplatesApi } from '../api/checklists.api';
import { checklistTemplateKeys } from '../api/checklists.keys';

export function useSetChecklistTemplateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      checklistTemplatesApi.setTemplateStatus(id, isActive),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: checklistTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: checklistTemplateKeys.detail(template.id) });
    },
  });
}
