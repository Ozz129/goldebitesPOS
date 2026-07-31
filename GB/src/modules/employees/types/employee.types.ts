export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_VACATION' | 'ON_LEAVE';

export type CredentialsStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface EmployeeUserAccount {
  id: string;
  email: string;
  status: CredentialsStatus;
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Employee {
  id: string;
  businessId: string;
  branchId: string | null;
  roleId: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  position: string | null;
  status: EmployeeStatus;
  hireDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWithShifts extends Employee {
  shifts: EmployeeShift[];
  userAccount: EmployeeUserAccount | null;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  position?: string;
  roleId?: string;
  branchId?: string;
  hireDate?: string;
  notes?: string;
}

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

export interface ShiftInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface GenerateEmployeeCredentialsPayload {
  email: string;
  roleId: string;
  branchId?: string;
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  status?: EmployeeStatus;
  branchId?: string;
  search?: string;
}
