import type { StatusTone } from '../../components/common/StatusChip';
import type { EquipmentStatus } from './types/maintenance.types';

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  OPERATIONAL: 'Operativo',
  IN_MAINTENANCE: 'En mantenimiento',
  OUT_OF_SERVICE: 'Fuera de servicio',
};

export const EQUIPMENT_STATUS_TONE: Record<EquipmentStatus, StatusTone> = {
  OPERATIONAL: 'success',
  IN_MAINTENANCE: 'warning',
  OUT_OF_SERVICE: 'error',
};
