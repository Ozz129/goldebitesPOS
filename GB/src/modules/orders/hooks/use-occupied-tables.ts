import { useMemo } from 'react';
import { useOrders } from './use-orders';
import { ACTIVE_STATUSES } from '../order-status';

const OCCUPIED_TABLES_POLL_INTERVAL_MS = 15_000;

/** Table numbers with a DINE_IN order still open (not yet delivered/cancelled) in this branch. */
export function useOccupiedTables(branchId: string | null | undefined): Set<string> {
  const query = useOrders(
    { branchId: branchId ?? undefined, orderType: 'DINE_IN', limit: 100 },
    { refetchInterval: OCCUPIED_TABLES_POLL_INTERVAL_MS, enabled: Boolean(branchId) },
  );

  return useMemo(() => {
    const occupied = new Set<string>();
    for (const order of query.data?.data ?? []) {
      if (order.tableNumber && ACTIVE_STATUSES.includes(order.status)) {
        occupied.add(order.tableNumber);
      }
    }
    return occupied;
  }, [query.data]);
}
