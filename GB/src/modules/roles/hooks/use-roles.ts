import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';
import { roleKeys } from '../api/roles.keys';

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => rolesApi.getRoles(),
    staleTime: 30_000,
  });
}
