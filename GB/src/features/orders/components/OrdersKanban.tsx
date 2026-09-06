import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { ArrowRight } from 'lucide-react';
import StatusChip from '../../../components/common/StatusChip';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import {
  ORDER_STATUS_SEQUENCE,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  nextStatusFor,
} from '../../../modules/orders/order-status';
import type { Order, OrderStatus } from '../../../modules/orders/types/order.types';
import PrintOrderButton from './PrintOrderButton';

interface OrdersKanbanProps {
  orders: Order[];
  onSelect: (order: Order) => void;
  onAdvance: (order: Order) => void;
  customerName: (order: Order) => string;
}

export default function OrdersKanban({ orders, onSelect, onAdvance, customerName }: OrdersKanbanProps) {
  const columns = ORDER_STATUS_SEQUENCE;

  return (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
      {columns.map((status: OrderStatus) => {
        const columnOrders = orders.filter((o) => o.status === status);
        return (
          <Box key={status} sx={{ minWidth: 280, flex: '0 0 280px' }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {ORDER_STATUS_LABELS[status]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {columnOrders.length}
              </Typography>
            </Stack>
            <Stack spacing={1.25} sx={{ minHeight: 80 }}>
              {columnOrders.map((order) => {
                const next = nextStatusFor(order.status);
                return (
                  <Card key={order.id}>
                    <CardActionArea onClick={() => onSelect(order)} sx={{ p: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        #{order.orderNumber}
                        {order.tableNumber && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
                            {order.orderType === 'CAR_SERVICE' ? 'Vehículo' : 'Mesa'} {order.tableNumber}
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>
                        {customerName(order)}
                      </Typography>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <StatusChip label={ORDER_TYPE_LABELS[order.orderType]} tone="neutral" />
                        <CurrencyDisplay value={order.totalAmount} variant="caption" sx={{ fontWeight: 700 }} />
                      </Stack>
                      <Stack direction="row" sx={{ mt: 0.75 }}>
                        <StatusChip
                          label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
                          tone={PAYMENT_STATUS_TONE[order.paymentStatus]}
                          size="small"
                        />
                      </Stack>
                    </CardActionArea>
                    <Stack direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'center', px: 1, pb: 1 }}>
                      <PrintOrderButton orderId={order.id} />
                      {next && (
                        <Tooltip title={`Avanzar a "${ORDER_STATUS_LABELS[next]}"`}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAdvance(order);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <ArrowRight size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>

                  </Card>
                );
              })}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
