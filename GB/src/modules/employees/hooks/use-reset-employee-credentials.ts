import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';

export function useResetEmployeeCredentials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.resetCredentials(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}
