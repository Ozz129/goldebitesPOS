import { useQuery } from '@tanstack/react-query';
import { maintenanceApi } from '../api/maintenance.api';
import { equipmentKeys } from '../api/maintenance.keys';

export function useEquipmentDetail(id: string | null) {
  return useQuery({
    queryKey: equipmentKeys.detail(id ?? ''),
    queryFn: () => maintenanceApi.getEquipmentDetail(id as string),
    enabled: Boolean(id),
  });
}
