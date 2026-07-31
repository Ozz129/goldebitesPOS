import { useQuery } from '@tanstack/react-query';
import { checklistTemplatesApi } from '../api/checklists.api';
import { checklistTemplateKeys } from '../api/checklists.keys';
import type { ChecklistTemplateFilters } from '../types/checklist.types';

export function useChecklistTemplates(filters: ChecklistTemplateFilters = {}) {
  return useQuery({
    queryKey: checklistTemplateKeys.list(filters),
    queryFn: () => checklistTemplatesApi.getTemplates(filters),
    staleTime: 30_000,
  });
}
