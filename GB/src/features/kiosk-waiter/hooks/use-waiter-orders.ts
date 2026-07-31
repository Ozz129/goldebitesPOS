import { useMemo } from 'react';
import { useAuthStore } from '../../../modules/auth/store/auth.store';
import { useOrders } from '../../../modules/orders/hooks/use-orders';
import { ACTIVE_STATUSES } from '../../../modules/orders/order-status';
import type { Order } from '../../../modules/orders/types/order.types';

const WAITER_POLL_INTERVAL_MS = 6_000;

/** Polls the current waiter's own active orders fast enough to notice a READY flip within one cycle. */
export function useWaiterOrders() {
  const userId = useAuthStore((s) => s.user?.id);

  const query = useOrders(
    { createdBy: userId, limit: 50 },
    { refetchInterval: WAITER_POLL_INTERVAL_MS },
  );

  const orders = useMemo<Order[]>(
    () => (query.data?.data ?? []).filter((order) => ACTIVE_STATUSES.includes(order.status)),
    [query.data],
  );

  return { ...query, orders };
}
