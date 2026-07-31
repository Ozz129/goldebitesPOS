import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';
import type { EmployeeFilters } from '../types/employee.types';

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeesApi.getEmployees(filters),
    staleTime: 30_000,
  });
}
