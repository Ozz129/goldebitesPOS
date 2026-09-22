import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tableNamesApi } from '../api/table-names.api';
import { tableNamesKeys } from '../api/table-names.keys';
import type { UpsertTableNamePayload } from '../types/table-name.types';

export function useUpsertTableName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertTableNamePayload) => tableNamesApi.upsert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableNamesKeys.all });
    },
  });
}
