import type { StatusTone } from '../../components/common/StatusChip';
import type { CredentialsStatus, EmployeeStatus } from './types/employee.types';

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  ON_VACATION: 'Vacaciones',
  ON_LEAVE: 'Incapacidad',
};

export const EMPLOYEE_STATUS_TONE: Record<EmployeeStatus, StatusTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  ON_VACATION: 'info',
  ON_LEAVE: 'warning',
};

export const CREDENTIALS_STATUS_LABELS: Record<CredentialsStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  BLOCKED: 'Bloqueado',
};

export const CREDENTIALS_STATUS_TONE: Record<CredentialsStatus, StatusTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  BLOCKED: 'error',
};

/** day_of_week: 0 = Sunday, matching Postgres EXTRACT(DOW). */
export const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
