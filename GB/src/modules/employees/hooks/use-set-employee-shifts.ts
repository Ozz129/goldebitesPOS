import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';
import type { ShiftInput } from '../types/employee.types';

export function useSetEmployeeShifts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, shifts }: { id: string; shifts: ShiftInput[] }) =>
      employeesApi.replaceShifts(id, shifts),
    onSuccess: (employee) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
    },
  });
}
