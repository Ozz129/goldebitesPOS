import { useQuery } from '@tanstack/react-query';
import { permissionsApi } from '../api/permissions.api';

/** Full permission catalog (code/module/description), for the Roles & Permissions screen. */
export function usePermissionCatalog() {
  return useQuery({
    queryKey: ['permissions', 'catalog'],
    queryFn: () => permissionsApi.getCatalog(),
    staleTime: 5 * 60_000,
  });
}
