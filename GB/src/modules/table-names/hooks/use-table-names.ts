import { useQuery } from '@tanstack/react-query';
import { tableNamesApi } from '../api/table-names.api';
import { tableNamesKeys } from '../api/table-names.keys';

/** Raw list — used by the admin config screen, which needs each row's id for edit/clear actions. */
export function useTableNames(branchId: string | null | undefined) {
  return useQuery({
    queryKey: tableNamesKeys.byBranch(branchId ?? ''),
    queryFn: () => tableNamesApi.getByBranch(branchId as string),
    enabled: Boolean(branchId),
    staleTime: 30_000,
  });
}
