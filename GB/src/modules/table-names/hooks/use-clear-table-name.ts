import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tableNamesApi } from '../api/table-names.api';
import { tableNamesKeys } from '../api/table-names.keys';

export function useClearTableName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, tableNumber }: { branchId: string; tableNumber: string }) =>
      tableNamesApi.clear(branchId, tableNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableNamesKeys.all });
    },
  });
}
