import { useQuery } from '@tanstack/react-query';
import { publicMenuApi } from '../api/public-menu.api';

export function usePublicMenu(businessId: string | undefined) {
  return useQuery({
    queryKey: ['public-menu', businessId],
    queryFn: () => publicMenuApi.getMenu(businessId as string),
    enabled: Boolean(businessId),
    retry: false,
  });
}
