import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistTemplatesApi } from '../api/checklists.api';
import { checklistTemplateKeys } from '../api/checklists.keys';
import type { TemplateItemInput } from '../types/checklist.types';

export function useReplaceChecklistTemplateItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: TemplateItemInput[] }) =>
      checklistTemplatesApi.replaceItems(id, items),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: checklistTemplateKeys.detail(template.id) });
    },
  });
}
