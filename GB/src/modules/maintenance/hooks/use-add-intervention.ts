import { useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../api/maintenance.api';
import { equipmentKeys } from '../api/maintenance.keys';
import type { CreateInterventionPayload } from '../types/maintenance.types';

export function useAddIntervention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateInterventionPayload }) =>
      maintenanceApi.addIntervention(id, payload),
    onSuccess: (equipment) => {
      queryClient.setQueryData(equipmentKeys.detail(equipment.id), equipment);
    },
  });
}
