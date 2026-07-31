import type { StatusTone } from '../../components/common/StatusChip';
import type { ChecklistRunStatus, ChecklistType } from './types/checklist.types';

export const CHECKLIST_TYPE_LABELS: Record<ChecklistType, string> = {
  OPENING: 'Apertura',
  CLOSING: 'Cierre',
};

export const CHECKLIST_RUN_STATUS_LABELS: Record<ChecklistRunStatus, string> = {
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
  INCOMPLETE: 'Incompleto',
};

export const CHECKLIST_RUN_STATUS_TONE: Record<ChecklistRunStatus, StatusTone> = {
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  INCOMPLETE: 'error',
};
