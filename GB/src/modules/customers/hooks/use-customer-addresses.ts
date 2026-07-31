import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import { customerKeys } from '../api/customers.keys';

export function useCustomerAddresses(customerId: string | null) {
  return useQuery({
    queryKey: customerKeys.addresses(customerId ?? ''),
    queryFn: () => customersApi.listAddresses(customerId as string),
    enabled: Boolean(customerId),
  });
}
