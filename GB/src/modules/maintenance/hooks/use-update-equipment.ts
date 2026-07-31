import { useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../api/maintenance.api';
import { equipmentKeys } from '../api/maintenance.keys';
import type { UpdateEquipmentPayload } from '../types/maintenance.types';

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEquipmentPayload }) =>
      maintenanceApi.updateEquipment(id, payload),
    onSuccess: (equipment) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(equipment.id) });
    },
  });
}
