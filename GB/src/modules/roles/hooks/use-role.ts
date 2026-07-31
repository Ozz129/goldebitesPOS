import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';
import { roleKeys } from '../api/roles.keys';

export function useRole(id: string | null) {
  return useQuery({
    queryKey: roleKeys.detail(id ?? ''),
    queryFn: () => rolesApi.getRole(id as string),
    enabled: Boolean(id),
  });
}
