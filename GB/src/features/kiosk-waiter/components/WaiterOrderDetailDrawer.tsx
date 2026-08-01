import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { CheckCircle } from 'lucide-react';
import { useSnackbar } from 'notistack';
import DetailDrawer from '../../../components/common/DetailDrawer';
import StatusChip from '../../../components/common/StatusChip';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import OrderTimer from '../../orders/components/OrderTimer';
import { useOrder } from '../../../modules/orders/hooks/use-order';
import { useUpdateOrderStatus } from '../../../modules/orders/hooks/use-update-order-status';
import { normalizeApiError } from '../../../lib/api/api-error';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  ORDER_TYPE_LABELS,
} from '../../../modules/orders/order-status';

interface WaiterOrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
}

export default function WaiterOrderDetailDrawer({ orderId, onClose }: WaiterOrderDetailDrawerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  if (!orderId) return null;

  function handleMarkDelivered() {
    if (!order) return;
    updateStatus.mutate(
      { id: order.id, status: 'DELIVERED' },
      {
        onSuccess: () => {
          enqueueSnackbar(`Pedido #${order.orderNumber} entregado`, { variant: 'success' });
          onClose();
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  if (isLoading || !order) {
    return (
      <DetailDrawer open={Boolean(orderId)} onClose={onClose} title="Cargando pedido...">
        <LoadingSkeleton variant="page" />
      </DetailDrawer>
    );
  }

  return (
    <DetailDrawer
      open={Boolean(orderId)}
      onClose={onClose}
      title={`Pedido #${order.orderNumber}`}
      subtitle={`${order.orderType === 'CAR_SERVICE' ? 'Vehículo' : 'Mesa'} ${order.tableNumber ?? '—'} · ${ORDER_TYPE_LABELS[order.orderType]}`}
      headerExtra={<StatusChip label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONE[order.status]} />}
      footer={
        order.status === 'READY' ? (
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<CheckCircle size={18} />}
            loading={updateStatus.isPending}
            onClick={handleMarkDelivered}
            sx={{ py: 1.5, fontSize: '1rem' }}
          >
            Marcar como entregado
          </Button>
        ) : undefined
      }
    >
      <Stack spacing={2.5}>
        <OrderTimer createdAt={order.createdAt} />

        <Divider />

        <Stack spacing={1.5}>
          {order.items.map((item) => (
            <Stack key={item.id} direction="row" sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {item.quantity}× {item.productNameSnapshot}
                </Typography>
                {item.notes && (
                  <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                    Nota: {item.notes}
                  </Typography>
                )}
              </Box>
              <CurrencyDisplay value={item.totalPrice} variant="body2" sx={{ fontWeight: 600 }} />
            </Stack>
          ))}
        </Stack>

        {order.notes && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Observaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.notes}
              </Typography>
            </Box>
          </>
        )}

        <Divider />

        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Total
          </Typography>
          <CurrencyDisplay value={order.totalAmount} variant="subtitle1" sx={{ fontWeight: 800 }} />
        </Stack>
      </Stack>
    </DetailDrawer>
  );
}
