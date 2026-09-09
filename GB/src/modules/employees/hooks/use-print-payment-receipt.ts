import { useCurrentBusiness } from '../../businesses/hooks/use-current-business';
import { useBusinessLogo } from '../../businesses/hooks/use-business-logo';
import { printPaymentReceipt } from '../utils/print-payment-receipt';
import type { Employee } from '../types/employee.types';

export function usePrintPaymentReceipt() {
  const { data: business } = useCurrentBusiness();
  const { data: logo } = useBusinessLogo();
  return (employee: Employee) =>
    printPaymentReceipt(employee, {
      businessName: business?.name,
      businessLogo: logo,
      legalName: business?.legalName,
    });
}
