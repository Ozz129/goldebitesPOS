import { useQuery } from '@tanstack/react-query';
import { businessesApi } from '../api/businesses.api';

export function useCurrentBusiness() {
  return useQuery({
    queryKey: ['businesses', 'me'],
    queryFn: businessesApi.getMine,
    staleTime: 60_000,
  });
}
