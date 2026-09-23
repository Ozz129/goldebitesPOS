import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';

/** Self-service — data resolves to null when the current user has no linked employee record. */
export function useMyShifts() {
  return useQuery({
    queryKey: employeeKeys.myShifts(),
    queryFn: () => employeesApi.getMyShifts(),
    staleTime: 30_000,
  });
}
