import { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { Plus, LayoutGrid, List as ListIcon, Tablet } from 'lucide-react';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/common/PageHeader';
import FilterBar from '../../../components/common/FilterBar';
import SearchInput from '../../../components/common/SearchInput';
import ErrorState from '../../../components/common/ErrorState';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import { Can } from '../../../modules/auth/components/can';
import { useAuthStore } from '../../../modules/auth/store/auth.store';
import { useOrders } from '../../../modules/orders/hooks/use-orders';
import { useCreateOrder } from '../../../modules/orders/hooks/use-create-order';
import { useUpdateOrderStatus } from '../../../modules/orders/hooks/use-update-order-status';
import { useCustomers } from '../../../modules/customers/hooks/use-customers';
import { normalizeApiError } from '../../../lib/api/api-error';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_SEQUENCE,
  ORDER_TYPE_LABELS,
  nextStatusFor,
} from '../../../modules/orders/order-status';
import type { Order, OrderStatus, OrderType } from '../../../modules/orders/types/order.types';
import OrdersTable from '../components/OrdersTable';
import OrdersKanban from '../components/OrdersKanban';
import OrderDetailDrawer from '../components/OrderDetailDrawer';
import NewOrderDrawer from '../components/NewOrderDrawer';
import type { NewOrderFormValues } from '../schemas/orderSchema';
import { KIOSK_PATHS } from '../../../routes/kioskConfig';

export default function OrdersPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [view, setView] = useState<'tabla' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos');
  const [typeFilter, setTypeFilter] = useState<OrderType | 'todos'>('todos');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const filters = useMemo(
    () => ({
      limit: 100,
      status: statusFilter === 'todos' ? undefined : statusFilter,
      orderType: typeFilter === 'todos' ? undefined : typeFilter,
    }),
    [statusFilter, typeFilter],
  );

  const { data, isLoading, isError, refetch } = useOrders(filters);
  const { data: customersData } = useCustomers({ limit: 100 });
  const createOrder = useCreateOrder();
  const updateStatus = useUpdateOrderStatus();
  const branchId = useAuthStore((s) => s.user?.branchId);

  const customerById = useMemo(
    () => new Map((customersData?.data ?? []).map((c) => [c.id, c])),
    [customersData],
  );

  const customerName = (order: Order): string => {
    if (!order.customerId) return 'Cliente ocasional';
    const customer = customerById.get(order.customerId);
    return customer ? `${customer.firstName} ${customer.lastName ?? ''}`.trim() : 'Cliente ocasional';
  };

  const orders = data?.data ?? [];

  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (order) => String(order.orderNumber).includes(q) || customerName(order).toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- customerName is recomputed from customerById each render, not a stable dep
  }, [orders, search, customerById]);

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

  function handleCreateOrder(values: NewOrderFormValues) {
    if (!branchId) {
      enqueueSnackbar('Tu usuario no tiene una sucursal asignada; no puedes crear pedidos.', {
        variant: 'error',
      });
      return;
    }

    createOrder.mutate(
      {
        branchId,
        customerId: values.customerId || undefined,
        orderType: values.orderType,
        tableNumber: values.tableNumber || undefined,
        deliveryAddress: values.deliveryAddress || undefined,
        deliveryInstructions: values.deliveryInstructions || undefined,
        discountAmount: values.discountAmount || undefined,
        deliveryFee: values.deliveryFee || undefined,
        notes: values.notes || undefined,
        items: values.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || undefined,
        })),
      },
      {
        onSuccess: () => {
          enqueueSnackbar('Pedido creado correctamente', { variant: 'success' });
          setNewOrderOpen(false);
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  return (
    <>
      <PageHeader
        title="Pedidos"
        subtitle="Gestiona la operación de pedidos en tiempo real, desde la creación hasta la entrega."
        breadcrumbs={[{ label: 'Pedidos' }]}
        actions={
          <>
            <ToggleButtonGroup
              value={view}
              exclusive
              size="small"
              onChange={(_, value) => value && setView(value)}
            >
              <ToggleButton value="kanban" aria-label="Vista kanban">
                <LayoutGrid size={16} />
              </ToggleButton>
              <ToggleButton value="tabla" aria-label="Vista tabla">
                <ListIcon size={16} />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              component="a"
              href={KIOSK_PATHS.waiter}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Tablet size={16} />}
            >
              Abrir en modo tablet ↗
            </Button>
            <Can permission="orders.create">
              <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setNewOrderOpen(true)}>
                Nuevo pedido
              </Button>
            </Can>
          </>
        }
      />

      <FilterBar
        onClear={() => {
          setSearch('');
          setStatusFilter('todos');
          setTypeFilter('todos');
        }}
        hasActiveFilters={Boolean(search) || statusFilter !== 'todos' || typeFilter !== 'todos'}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por # de pedido o cliente..." />
        <TextField
          select
          size="small"
          label="Estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="todos">Todos los estados</MenuItem>
          {ORDER_STATUS_SEQUENCE.concat('CANCELLED').map((status) => (
            <MenuItem key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Tipo"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="todos">Todos los tipos</MenuItem>
          {Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </FilterBar>

      {isLoading ? (
        <LoadingSkeleton variant={view === 'kanban' ? 'cards' : 'table'} rows={8} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : view === 'kanban' ? (
        <OrdersKanban
          orders={filtered}
          onSelect={(order) => setSelectedOrderId(order.id)}
          onAdvance={handleAdvance}
          customerName={customerName}
        />
      ) : (
        <OrdersTable
          orders={filtered}
          onSelect={(order) => setSelectedOrderId(order.id)}
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

      <NewOrderDrawer open={newOrderOpen} onClose={() => setNewOrderOpen(false)} onSubmit={handleCreateOrder} />
    </>
  );
}
