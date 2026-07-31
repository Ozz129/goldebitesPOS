import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import { ArrowRight } from 'lucide-react';
import StatusChip from '../../../components/common/StatusChip';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import {
  ORDER_STATUS_SEQUENCE,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  nextStatusFor,
  isOrderDelayed,
} from '../../../modules/orders/order-status';
import type { Order, OrderStatus } from '../../../modules/orders/types/order.types';
import OrderTimer from './OrderTimer';
import { statusColors } from '../../../theme/palette';

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
                const delayed = isOrderDelayed(order.status, order.createdAt);
                const next = nextStatusFor(order.status);
                return (
                  <Card
                    key={order.id}
                    sx={{
                      borderColor: delayed ? alpha(statusColors.error, 0.5) : undefined,
                    }}
                  >
                    <CardActionArea onClick={() => onSelect(order)} sx={{ p: 1.5 }}>
                      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          #{order.orderNumber}
                        </Typography>
                        <OrderTimer createdAt={order.createdAt} compact />
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>
                        {customerName(order)}
                      </Typography>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <StatusChip label={ORDER_TYPE_LABELS[order.orderType]} tone="neutral" />
                        <CurrencyDisplay value={order.totalAmount} variant="caption" sx={{ fontWeight: 700 }} />
                      </Stack>
                      {delayed && <StatusChip label="Retrasado" tone="error" size="small" />}
                    </CardActionArea>
                    {next && (
                      <Stack direction="row" sx={{ justifyContent: 'flex-end', px: 1, pb: 1 }}>
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
                      </Stack>
                    )}
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
