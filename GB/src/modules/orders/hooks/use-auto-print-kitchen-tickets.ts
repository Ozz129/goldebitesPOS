import { useEffect, useRef } from 'react';
import { ordersApi } from '../api/orders.api';
import { printKitchenTicket } from '../utils/print-kitchen-ticket';
import type { Order } from '../types/order.types';

const STORAGE_KEY = 'gb-pos:orders-printed-order-ids';
const MAX_STORED_IDS = 300;

function loadPrintedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function savePrintedIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids).slice(-MAX_STORED_IDS)));
}

/**
 * Imprime automáticamente la comanda de cada pedido nuevo confirmado (no PENDING/CANCELLED).
 * Los pedidos que ya existían al montar el hook (p.ej. tras recargar la página) se marcan como
 * "vistos" sin imprimir, para no reimprimir todo el historial del día.
 */
export function useAutoPrintKitchenTickets(orders: Order[] | undefined, businessName: string | undefined, enabled: boolean) {
  const printedIds = useRef<Set<string>>(loadPrintedIds());
  const isFirstLoad = useRef(true);
  const printingIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !orders) return;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      orders.forEach((order) => printedIds.current.add(order.id));
      savePrintedIds(printedIds.current);
      return;
    }

    const newOrders = orders.filter(
      (order) => !printedIds.current.has(order.id) && !printingIds.current.has(order.id),
    );
    if (newOrders.length === 0) return;

    newOrders.forEach((order) => {
      printingIds.current.add(order.id);
      ordersApi
        .getOrder(order.id)
        .then((fullOrder) => printKitchenTicket(fullOrder, { businessName }))
        .catch(() => {
          // Si falla la carga de items no bloqueamos la lista; el usuario puede reimprimir manualmente.
        })
        .finally(() => {
          printedIds.current.add(order.id);
          printingIds.current.delete(order.id);
          savePrintedIds(printedIds.current);
        });
    });
  }, [orders, businessName, enabled]);
}
