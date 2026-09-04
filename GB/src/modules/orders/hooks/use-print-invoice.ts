import { useCurrentBusiness } from '../../businesses/hooks/use-current-business';
import { ordersApi } from '../api/orders.api';
import { printInvoice } from '../utils/print-invoice';
import type { OrderWithItems } from '../types/order.types';
import type { Payment } from '../types/payment.types';

export function usePrintInvoice() {
  const { data: business } = useCurrentBusiness();
  const options = {
    businessName: business?.name,
    legalName: business?.legalName,
    taxId: business?.taxId,
    phone: business?.phone,
  };

  return {
    /** Imprime de inmediato con los datos ya cargados en memoria (botón manual). */
    printNow(order: OrderWithItems, payments: Payment[]) {
      printInvoice(order, payments, options);
    },
    /** Trae el pedido y sus pagos más recientes del servidor antes de imprimir (auto-impresión tras un pago). */
    async printByOrderId(orderId: string) {
      const [order, payments] = await Promise.all([
        ordersApi.getOrder(orderId),
        ordersApi.getPayments(orderId),
      ]);
      printInvoice(order, payments, options);
    },
  };
}
