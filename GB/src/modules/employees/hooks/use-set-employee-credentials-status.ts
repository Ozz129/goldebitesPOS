import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';
import type { CredentialsStatus } from '../types/employee.types';

export function useSetEmployeeCredentialsStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CredentialsStatus }) =>
      employeesApi.setCredentialsStatus(id, status),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}
