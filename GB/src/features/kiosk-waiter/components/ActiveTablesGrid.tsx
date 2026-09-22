import { useMemo } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MapPin } from 'lucide-react';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import StatusChip from '../../../components/common/StatusChip';
import { useOrders } from '../../../modules/orders/hooks/use-orders';
import {
  ACTIVE_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  getOrderIdentifierLabel,
} from '../../../modules/orders/order-status';
import { useTableNameMap } from '../../../modules/table-names/hooks/use-table-name-map';

interface ActiveTablesGridProps {
  branchId: string | null | undefined;
  onSelect: (orderId: string) => void;
}

const ACTIVE_TABLES_POLL_INTERVAL_MS = 15_000;

/** Touch-friendly "Mesas activas" — every table with an active DINE_IN order, tap to open it. */
export default function ActiveTablesGrid({ branchId, onSelect }: ActiveTablesGridProps) {
  const tableNames = useTableNameMap(branchId);
  const { data, isLoading } = useOrders(
    { branchId: branchId ?? undefined, orderType: 'DINE_IN', limit: 100 },
    { refetchInterval: ACTIVE_TABLES_POLL_INTERVAL_MS, enabled: Boolean(branchId) },
  );

  const activeOrders = useMemo(
    () => (data?.data ?? []).filter((order) => order.tableNumber && ACTIVE_STATUSES.includes(order.status)),
    [data],
  );

  if (!isLoading && activeOrders.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay mesas con un pedido activo en este momento.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
      {activeOrders.map((order) => (
        <ButtonBase
          key={order.id}
          onClick={() => onSelect(order.id)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0.5,
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            textAlign: 'left',
            '&:active': { bgcolor: 'action.selected' },
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <MapPin size={20} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {getOrderIdentifierLabel(order, tableNames)}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            #{order.orderNumber}
          </Typography>
          <StatusChip label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONE[order.status]} />
          <CurrencyDisplay value={order.totalAmount} variant="subtitle1" sx={{ fontWeight: 800 }} />
        </ButtonBase>
      ))}
    </Box>
  );
}
