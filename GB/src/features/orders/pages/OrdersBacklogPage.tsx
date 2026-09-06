import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/common/PageHeader';
import ErrorState from '../../../components/common/ErrorState';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import { CheckCircle2 } from 'lucide-react';
import { useOrdersBacklog } from '../../../modules/orders/hooks/use-orders-backlog';
import { useUpdateOrderStatus } from '../../../modules/orders/hooks/use-update-order-status';
import { useCustomers } from '../../../modules/customers/hooks/use-customers';
import { normalizeApiError } from '../../../lib/api/api-error';
import { ORDER_STATUS_LABELS, nextStatusFor } from '../../../modules/orders/order-status';
import type { Order } from '../../../modules/orders/types/order.types';
import OrdersKanban from '../components/OrdersKanban';
import OrderDetailDrawer from '../components/OrderDetailDrawer';

export default function OrdersBacklogPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: backlog, isLoading, isError, refetch } = useOrdersBacklog();
  const { data: customersData } = useCustomers({ limit: 100 });
  const updateStatus = useUpdateOrderStatus();

  const customerById = useMemo(
    () => new Map((customersData?.data ?? []).map((c) => [c.id, c])),
    [customersData],
  );

  const customerName = (order: Order): string => {
    if (order.customerName) return order.customerName;
    if (!order.customerId) return 'Cliente ocasional';
    const customer = customerById.get(order.customerId);
    return customer ? `${customer.firstName} ${customer.lastName ?? ''}`.trim() : 'Cliente ocasional';
  };

  const orders = backlog ?? [];

  function handleAdvance(order: Order) {
    const next = nextStatusFor(order.status);
    if (!next) return;
    updateStatus.mutate(
      { id: order.id, status: next },
      {
        onSuccess: () => {
          enqueueSnackbar(`Pedido #${order.orderNumber} pasó a "${ORDER_STATUS_LABELS[next]}"`, {
            variant: 'success',
          });
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  function handleCancel(order: Order, reason: string) {
    updateStatus.mutate(
      { id: order.id, status: 'CANCELLED', notes: reason },
      {
        onSuccess: () => {
          enqueueSnackbar(`Pedido #${order.orderNumber} cancelado`, { variant: 'warning' });
          setSelectedOrderId(null);
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  return (
    <>
      <PageHeader
        title="Pedidos atrasados"
        subtitle="Pedidos de días anteriores que quedaron sin cerrar (ni entregados ni cancelados). Ciérralos para dejar la operación al día."
        breadcrumbs={[{ label: 'Pedidos', path: '/pedidos' }, { label: 'Atrasados' }]}
      />

      {isLoading ? (
        <LoadingSkeleton variant="cards" rows={4} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No hay pedidos atrasados"
          description="Todos los pedidos de días anteriores están cerrados."
        />
      ) : (
        <OrdersKanban
          orders={orders}
          onSelect={(order) => setSelectedOrderId(order.id)}
          onAdvance={handleAdvance}
          customerName={customerName}
        />
      )}

      <OrderDetailDrawer
        orderId={selectedOrderId}
        customerName={customerName}
        onClose={() => setSelectedOrderId(null)}
        onAdvance={handleAdvance}
        onCancel={handleCancel}
      />
    </>
  );
}
