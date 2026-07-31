export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_VACATION = 'ON_VACATION',
  ON_LEAVE = 'ON_LEAVE',
}

export interface ShiftInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface CreateEmployeeData {
  businessId: string;
  branchId?: string;
  roleId?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  position?: string;
  hireDate?: string;
  notes?: string;
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
}

export interface EmployeeQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: EmployeeStatus;
  branchId?: string;
  search?: string;
}
