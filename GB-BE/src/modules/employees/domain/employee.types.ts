export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_VACATION = 'ON_VACATION',
  ON_LEAVE = 'ON_LEAVE',
}

export enum EmployeePayFrequency {
  SHIFT = 'SHIFT',
  WEEK = 'WEEK',
  BIWEEKLY = 'BIWEEKLY',
  MONTH = 'MONTH',
}

/** The subset an employee may self-select for their own payroll cadence — SHIFT stays an admin-only classification. */
export const SELF_SERVICE_PAY_FREQUENCIES = [
  EmployeePayFrequency.WEEK,
  EmployeePayFrequency.BIWEEKLY,
  EmployeePayFrequency.MONTH,
] as const;

export interface ShiftInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface CreateEmployeeData {
  businessId: string;
  branchId?: string;
  /** Required — also becomes the auto-created login account's role. */
  roleId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  position?: string;
  hireDate?: string;
  notes?: string;
  payRate?: number;
  payFrequency?: EmployeePayFrequency;
}

export interface UpdateEmployeeData {
  branchId?: string;
  roleId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  position?: string;
  hireDate?: string;
  notes?: string;
  payRate?: number;
  payFrequency?: EmployeePayFrequency;
}

export interface EmployeeQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: EmployeeStatus;
  branchId?: string;
  search?: string;
}
