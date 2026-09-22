import { useAuthStore } from '../../auth/store/auth.store';
import { useCurrentBusiness } from '../../businesses/hooks/use-current-business';
import { useBusinessLogo } from '../../businesses/hooks/use-business-logo';
import { useTableNameMap } from '../../table-names/hooks/use-table-name-map';
import { printKitchenTicket } from '../utils/print-kitchen-ticket';
import type { OrderWithItems } from '../types/order.types';

export function usePrintKitchenTicket() {
  const { data: business } = useCurrentBusiness();
  const { data: logo } = useBusinessLogo();
  const branchId = useAuthStore((s) => s.user?.branchId);
  const tableNames = useTableNameMap(branchId);
  return (order: OrderWithItems) =>
    printKitchenTicket(order, { businessName: business?.name, businessLogo: logo, tableNames });
}
