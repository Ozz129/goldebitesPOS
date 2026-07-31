import { useQuery } from '@tanstack/react-query';
import { maintenanceApi } from '../api/maintenance.api';
import { equipmentKeys } from '../api/maintenance.keys';
import type { EquipmentFilters } from '../types/maintenance.types';

export function useEquipmentList(filters: EquipmentFilters = {}) {
  return useQuery({
    queryKey: equipmentKeys.list(filters),
    queryFn: () => maintenanceApi.getEquipment(filters),
    staleTime: 30_000,
  });
}
