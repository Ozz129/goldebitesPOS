import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import { customerKeys } from '../api/customers.keys';
import type { CustomerFilters } from '../types/customer.types';

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customersApi.getCustomers(filters),
    staleTime: 30_000,
  });
}
