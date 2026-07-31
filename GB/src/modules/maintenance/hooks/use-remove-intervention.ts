import { useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../api/maintenance.api';
import { equipmentKeys } from '../api/maintenance.keys';

export function useRemoveIntervention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, interventionId }: { id: string; interventionId: string }) =>
      maintenanceApi.removeIntervention(id, interventionId),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(id) });
    },
  });
}
