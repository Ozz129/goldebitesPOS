import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { ChevronLeft } from 'lucide-react';
import StatusChip from '../../../components/common/StatusChip';
import OrderTimer from '../../orders/components/OrderTimer';
import { useOrder } from '../../../modules/orders/hooks/use-order';
import { useUpdateKitchenStatus } from '../../../modules/kitchen/hooks/use-update-kitchen-status';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  ORDER_TYPE_LABELS,
  isOrderDelayed,
} from '../../../modules/orders/order-status';
import type { Order } from '../../../modules/orders/types/order.types';
import { statusColors } from '../../../theme/palette';

interface SwipeableTicketCardProps {
  order: Order;
  onSuccess: (order: Order, status: 'PREPARING' | 'READY') => void;
  onError: (error: unknown) => void;
}

const SWIPE_THRESHOLD_PX = 120;
const SWIPE_MAX_PX = 160;

export default function SwipeableTicketCard({ order, onSuccess, onError }: SwipeableTicketCardProps) {
  const delayed = isOrderDelayed(order.status, order.createdAt);
  const { data: fullOrder } = useOrder(order.id);
  const items = fullOrder?.items ?? [];
  const updateStatus = useUpdateKitchenStatus();

  const [dragX, setDragX] = useState(0);
  const [committing, setCommitting] = useState(false);

  function handleAdvance() {
    const nextStatus = order.status === 'CONFIRMED' ? 'PREPARING' : 'READY';
    setCommitting(true);
    updateStatus.mutate(
      { orderId: order.id, status: nextStatus },
      {
        onSuccess: () => {
          setCommitting(false);
          setDragX(0);
          onSuccess(order, nextStatus);
        },
        onError: (error) => {
          setCommitting(false);
          setDragX(0);
          onError(error);
        },
      },
    );
  }

  const handlers = useSwipeable({
    onSwiping: (event) => {
      if (committing) return;
      const amount = event.dir === 'Left' ? Math.min(event.absX, SWIPE_MAX_PX) : 0;
      setDragX(amount);
    },
    onSwiped: (event) => {
      if (committing) return;
      if (event.dir === 'Left' && event.absX >= SWIPE_THRESHOLD_PX) {
        handleAdvance();
      } else {
        setDragX(0);
      }
    },
    delta: 10,
    trackMouse: true,
  });

  const progress = Math.min(dragX / SWIPE_THRESHOLD_PX, 1);

  return (
    <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pr: 3,
          backgroundColor: alpha(statusColors.success, 0.25 + progress * 0.5),
        }}
      >
        <ChevronLeft size={28} color={statusColors.success} />
      </Box>
      <Card
        {...handlers}
        sx={{
          borderColor: delayed ? alpha(statusColors.error, 0.55) : undefined,
          borderWidth: delayed ? 2 : 1,
          transform: `translateX(-${dragX}px)`,
          transition: dragX === 0 ? 'transform 0.2s ease' : 'none',
          opacity: committing ? 0.5 : 1,
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
      >
        <CardContent>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                #{order.orderNumber}
              </Typography>
              <StatusChip label={ORDER_TYPE_LABELS[order.orderType]} tone="neutral" />
            </Box>
            <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
              <OrderTimer createdAt={order.createdAt} />
              <StatusChip label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONE[order.status]} />
            </Stack>
          </Stack>

          {order.tableNumber && (
            <Typography variant="body2" color="text.secondary">
              {order.orderType === 'CAR_SERVICE' ? 'Vehículo' : 'Mesa'} {order.tableNumber}
            </Typography>
          )}

          {delayed && (
            <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              ⚠ Pedido fuera del tiempo estándar de preparación
            </Typography>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Stack spacing={1.5}>
            {items.map((item) => (
              <Box key={item.id}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {item.quantity}× {item.productNameSnapshot}
                </Typography>
                {item.notes && (
                  <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                    Nota: {item.notes}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>

          {order.notes && (
            <Typography
              variant="body2"
              sx={{ display: 'block', mt: 1.5, p: 1, borderRadius: 1, backgroundColor: alpha(statusColors.warning, 0.12) }}
            >
              📝 {order.notes}
            </Typography>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Desliza para avanzar
            </Typography>
            <ChevronLeft size={16} />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
