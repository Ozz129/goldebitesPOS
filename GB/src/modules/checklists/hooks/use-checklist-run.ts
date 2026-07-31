import { useQuery } from '@tanstack/react-query';
import { checklistRunsApi } from '../api/checklists.api';
import { checklistRunKeys } from '../api/checklists.keys';

export function useChecklistRun(id: string | null) {
  return useQuery({
    queryKey: checklistRunKeys.detail(id ?? ''),
    queryFn: () => checklistRunsApi.getRun(id as string),
    enabled: Boolean(id),
  });
}
