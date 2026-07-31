import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi } from '../api/kitchen.api';
import { kitchenKeys } from '../api/kitchen.keys';
import { orderKeys } from '../../orders/api/orders.keys';
import type { OrderStatus } from '../../orders/types/order.types';

export function useUpdateKitchenStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: Extract<OrderStatus, 'PREPARING' | 'READY'>;
    }) => kitchenApi.updateStatus(orderId, status),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
