import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { orderKeys } from '../api/orders.keys';

export function useOrderPayments(orderId: string | null) {
  return useQuery({
    queryKey: orderKeys.payments(orderId ?? ''),
    queryFn: () => ordersApi.getPayments(orderId as string),
    enabled: Boolean(orderId),
  });
}
