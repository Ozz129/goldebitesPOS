import { useQuery } from '@tanstack/react-query';
import { hrApi } from '../api/hr.api';
import { hrKeys } from '../api/hr.keys';

export function useMyHrProfile() {
  return useQuery({
    queryKey: hrKeys.myProfile(),
    queryFn: () => hrApi.getMyProfile(),
    staleTime: 60_000,
  });
}
