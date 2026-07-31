import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';
import type { GenerateEmployeeCredentialsPayload } from '../types/employee.types';

export function useGenerateEmployeeCredentials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GenerateEmployeeCredentialsPayload }) =>
      employeesApi.generateCredentials(id, payload),
    onSuccess: ({ employee }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
    },
  });
}
