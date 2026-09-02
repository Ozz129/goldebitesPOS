import { useCurrentBusiness } from '../../businesses/hooks/use-current-business';
import { printKitchenTicket } from '../utils/print-kitchen-ticket';
import type { OrderWithItems } from '../types/order.types';

export function usePrintKitchenTicket() {
  const { data: business } = useCurrentBusiness();
  return (order: OrderWithItems) => printKitchenTicket(order, { businessName: business?.name });
}
