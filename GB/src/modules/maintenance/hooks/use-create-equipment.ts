import { useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../api/maintenance.api';
import { equipmentKeys } from '../api/maintenance.keys';
import type { CreateEquipmentPayload } from '../types/maintenance.types';

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEquipmentPayload) => maintenanceApi.createEquipment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
    },
  });
}
