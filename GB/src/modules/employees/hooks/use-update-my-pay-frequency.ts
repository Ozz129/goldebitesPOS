import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';
import type { EmployeePayFrequency } from '../types/employee.types';

export function useUpdateMyPayFrequency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payFrequency: EmployeePayFrequency) => employeesApi.updateMyPayFrequency(payFrequency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.myPayroll() });
    },
  });
}
