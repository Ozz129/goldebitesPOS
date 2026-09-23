import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';
import type { ShiftInput } from '../types/employee.types';

export function useReplaceMyShifts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shifts: ShiftInput[]) => employeesApi.replaceMyShifts(shifts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.myShifts() });
    },
  });
}
