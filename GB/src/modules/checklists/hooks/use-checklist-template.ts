import { useQuery } from '@tanstack/react-query';
import { checklistTemplatesApi } from '../api/checklists.api';
import { checklistTemplateKeys } from '../api/checklists.keys';

export function useChecklistTemplate(id: string | null) {
  return useQuery({
    queryKey: checklistTemplateKeys.detail(id ?? ''),
    queryFn: () => checklistTemplatesApi.getTemplate(id as string),
    enabled: Boolean(id),
  });
}
