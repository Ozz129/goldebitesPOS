import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';
import { roleKeys } from '../api/roles.keys';
import type { UpdateRolePayload } from '../types/role.types';

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      rolesApi.updateRole(id, payload),
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(role.id) });
    },
  });
}
