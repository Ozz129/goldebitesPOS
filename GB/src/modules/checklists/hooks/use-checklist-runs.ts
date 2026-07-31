import { useQuery } from '@tanstack/react-query';
import { checklistRunsApi } from '../api/checklists.api';
import { checklistRunKeys } from '../api/checklists.keys';
import type { ChecklistRunFilters } from '../types/checklist.types';

export function useChecklistRuns(filters: ChecklistRunFilters = {}) {
  return useQuery({
    queryKey: checklistRunKeys.list(filters),
    queryFn: () => checklistRunsApi.getRuns(filters),
    staleTime: 15_000,
  });
}
