import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { ChevronRight } from 'lucide-react';
import { keyframes } from '@mui/material/styles';
import OrderTimer from '../../orders/components/OrderTimer';
import StatusChip from '../../../components/common/StatusChip';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '../../../modules/orders/order-status';
import type { Order } from '../../../modules/orders/types/order.types';

interface WaiterOrderListProps {
  orders: Order[];
  onSelect: (order: Order) => void;
}

const pulse = keyframes`
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(76, 175, 109, 0.18); }
`;

function identifierLabel(order: Order): string {
  return order.orderType === 'CAR_SERVICE' ? 'Vehículo' : 'Mesa';
}

export default function WaiterOrderList({ orders, onSelect }: WaiterOrderListProps) {
  if (orders.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
        No tienes pedidos activos.
      </Typography>
    );
  }

  return (
    <Stack spacing={0} sx={{ overflowY: 'auto' }}>
      {orders.map((order) => (
        <ButtonBase
          key={order.id}
          onClick={() => onSelect(order)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            textAlign: 'left',
            animation: order.status === 'READY' ? `${pulse} 1.4s ease-in-out infinite` : 'none',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>
              #{order.orderNumber} · {identifierLabel(order)} {order.tableNumber ?? '—'}
            </Typography>
            <OrderTimer createdAt={order.createdAt} />
          </Box>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <StatusChip label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONE[order.status]} />
            <ChevronRight size={18} />
          </Stack>
        </ButtonBase>
      ))}
    </Stack>
  );
}
