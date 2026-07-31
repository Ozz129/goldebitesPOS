import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { LogOut } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../modules/auth/store/auth.store';
import { useLogout } from '../../../modules/auth/hooks/use-logout';
import { useCurrentBusiness } from '../../../modules/businesses/hooks/use-current-business';
import { useCreateOrder } from '../../../modules/orders/hooks/use-create-order';
import { useUpdateOrderStatus } from '../../../modules/orders/hooks/use-update-order-status';
import { normalizeApiError } from '../../../lib/api/api-error';
import { useNotificationsStore } from '../../../store/notificationsStore';
import type { Order, OrderStatus, OrderType } from '../../../modules/orders/types/order.types';
import type { Product } from '../../../modules/products/types/product.types';
import { useWaiterOrders } from '../hooks/use-waiter-orders';
import CategoryTabs from '../components/CategoryTabs';
import ProductGrid from '../components/ProductGrid';
import CartPanel, { type CartLine } from '../components/CartPanel';
import WaiterOrderList from '../components/WaiterOrderList';
import WaiterOrderDetailDrawer from '../components/WaiterOrderDetailDrawer';

export default function WaiterKioskPage() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const business = useCurrentBusiness();
  const branchId = useAuthStore((s) => s.user?.branchId);
  const logout = useLogout();
  const addNotification = useNotificationsStore((s) => s.addNotification);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const createOrder = useCreateOrder();
  const updateStatus = useUpdateOrderStatus();
  const { orders } = useWaiterOrders();

  const previousStatuses = useRef<Map<string, OrderStatus>>(new Map());

  useEffect(() => {
    for (const order of orders) {
      const prev = previousStatuses.current.get(order.id);
      if (prev && prev !== 'READY' && order.status === 'READY') {
        enqueueSnackbar(`¡Pedido #${order.orderNumber} listo! Mesa ${order.tableNumber ?? '—'}`, {
          variant: 'success',
          persist: true,
          // Ancla arriba (no abajo, el default) para no tapar el botón "Marcar
          // como entregado" del panel de detalle, que también vive abajo — este
          // aviso queda fijo hasta que el mesero lo cierra, así que si se
          // superpusiera con ese botón, bloquearía justo la acción que sigue.
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          action: (key) => (
            <Button color="inherit" size="small" onClick={() => closeSnackbar(key)}>
              OK
            </Button>
          ),
        });
        addNotification({
          title: 'Pedido listo',
          message: `#${order.orderNumber} — Mesa ${order.tableNumber ?? '—'}`,
          level: 'success',
        });
      }
    }
    previousStatuses.current = new Map(orders.map((order) => [order.id, order.status]));
  }, [orders, enqueueSnackbar, closeSnackbar, addNotification]);

  function handleAddToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...prev, { productId: product.id, name: product.name, unitPrice: product.salePrice, quantity: 1 }];
    });
  }

  function handleIncrement(productId: string) {
    setCart((prev) =>
      prev.map((line) => (line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line)),
    );
  }

  function handleDecrement(productId: string) {
    setCart((prev) =>
      prev
        .map((line) => (line.productId === productId ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0),
    );
  }

  function handleRemove(productId: string) {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }

  function handleSubmit() {
    if (!branchId) {
      enqueueSnackbar('Tu usuario no tiene una sucursal asignada; no puedes crear pedidos.', {
        variant: 'error',
      });
      return;
    }

    createOrder.mutate(
      {
        branchId,
        orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber || undefined : undefined,
        items: cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      },
      {
        onSuccess: (order) => {
          updateStatus.mutate({ id: order.id, status: 'CONFIRMED' });
          enqueueSnackbar(`Pedido #${order.orderNumber} enviado a cocina`, { variant: 'success' });
          setCart([]);
          setTableNumber('');
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {business.data?.name ?? 'Golden Bites'} · Mesero
        </Typography>
        <Button
          size="small"
          color="inherit"
          startIcon={<LogOut size={16} />}
          onClick={() => logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) })}
        >
          Salir
        </Button>
      </Stack>

      <Stack direction="row" sx={{ flex: 1, overflow: 'hidden' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CategoryTabs value={categoryId} onChange={setCategoryId} />
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <ProductGrid categoryId={categoryId} onSelect={handleAddToCart} />
          </Box>
        </Box>

        <Box
          sx={{
            width: 380,
            flexShrink: 0,
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flexBasis: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Typography variant="overline" color="text.secondary" sx={{ px: 2, pt: 1.5, fontWeight: 700 }}>
              Mis pedidos ({orders.length})
            </Typography>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <WaiterOrderList orders={orders} onSelect={(order: Order) => setSelectedOrderId(order.id)} />
            </Box>
          </Box>
          <Divider />
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <CartPanel
              cart={cart}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemove}
              tableNumber={tableNumber}
              onTableNumberChange={setTableNumber}
              orderType={orderType}
              onOrderTypeChange={setOrderType}
              onSubmit={handleSubmit}
              submitting={createOrder.isPending}
            />
          </Box>
        </Box>
      </Stack>

      <WaiterOrderDetailDrawer orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
    </Box>
  );
}
