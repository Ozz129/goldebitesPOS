import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';
import { roleKeys } from '../api/roles.keys';

export function useSetRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permissionCodes }: { id: string; permissionCodes: string[] }) =>
      rolesApi.setRolePermissions(id, permissionCodes),
    onSuccess: (_permissions, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
    },
  });
}
