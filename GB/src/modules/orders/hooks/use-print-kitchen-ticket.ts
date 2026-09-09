import { useCurrentBusiness } from '../../businesses/hooks/use-current-business';
import { useBusinessLogo } from '../../businesses/hooks/use-business-logo';
import { printKitchenTicket } from '../utils/print-kitchen-ticket';
import type { OrderWithItems } from '../types/order.types';

export function usePrintKitchenTicket() {
  const { data: business } = useCurrentBusiness();
  const { data: logo } = useBusinessLogo();
  return (order: OrderWithItems) =>
    printKitchenTicket(order, { businessName: business?.name, businessLogo: logo });
}
