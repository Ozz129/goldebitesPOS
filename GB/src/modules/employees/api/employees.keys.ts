import type { EmployeeFilters } from '../types/employee.types';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: EmployeeFilters) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  myShifts: () => [...employeeKeys.all, 'me', 'shifts'] as const,
  myPayroll: () => [...employeeKeys.all, 'me', 'payroll'] as const,
};
