import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { orderKeys } from '../api/orders.keys';
import type { CreateOrderItemPayload } from '../types/order.types';

export function useAddOrderItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: CreateOrderItemPayload[] }) =>
      ordersApi.addItems(id, items),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
    },
  });
}
