import { useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Stack from '@mui/material/Stack';
import { Maximize, Minimize, ChefHat, Tablet } from 'lucide-react';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/common/PageHeader';
import { KIOSK_PATHS } from '../../../routes/kioskConfig';
import FilterBar from '../../../components/common/FilterBar';
import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import { useKitchenQueue } from '../../../modules/kitchen/hooks/use-kitchen-queue';
import { useUpdateKitchenStatus } from '../../../modules/kitchen/hooks/use-update-kitchen-status';
import { normalizeApiError } from '../../../lib/api/api-error';
import { isOrderDelayed, ORDER_STATUS_LABELS } from '../../../modules/orders/order-status';
import type { Order } from '../../../modules/orders/types/order.types';
import KitchenOrderCard from '../components/KitchenOrderCard';

export default function KitchenPage() {
  const { enqueueSnackbar } = useSnackbar();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'antiguos' | 'recientes'>('antiguos');

  const { data: queue, isLoading, isError, refetch } = useKitchenQueue();
  const updateStatus = useUpdateKitchenStatus();

  const kitchenOrders = useMemo(() => {
    const list = queue ?? [];
    return [...list].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'antiguos' ? diff : -diff;
    });
  }, [queue, sortOrder]);

  const delayedCount = kitchenOrders.filter((o) => isOrderDelayed(o.status, o.createdAt)).length;

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }

  function handleStatusChange(order: Order, status: 'PREPARING' | 'READY') {
    updateStatus.mutate(
      { orderId: order.id, status },
      {
        onSuccess: () => {
          enqueueSnackbar(`Pedido #${order.orderNumber} ahora está "${ORDER_STATUS_LABELS[status]}"`, {
            variant: 'success',
          });
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  return (
    <Box ref={containerRef} sx={{ backgroundColor: 'background.default', p: isFullscreen ? 3 : 0 }}>
      <PageHeader
        title="Cocina"
        subtitle={`${kitchenOrders.length} pedidos activos${delayedCount > 0 ? ` · ${delayedCount} retrasados` : ''}`}
        breadcrumbs={[{ label: 'Cocina' }]}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              component="a"
              href={KIOSK_PATHS.kitchen}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Tablet size={16} />}
            >
              Abrir en modo tablet ↗
            </Button>
            <Button
              variant="outlined"
              startIcon={isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            </Button>
          </Stack>
        }
      />

      <FilterBar>
        <ToggleButtonGroup
          value={sortOrder}
          exclusive
          size="small"
          onChange={(_, value) => value && setSortOrder(value)}
        >
          <ToggleButton value="antiguos">Más antiguos primero</ToggleButton>
          <ToggleButton value="recientes">Más recientes primero</ToggleButton>
        </ToggleButtonGroup>
      </FilterBar>

      {isLoading ? (
        <LoadingSkeleton variant="cards" rows={4} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : kitchenOrders.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No hay pedidos activos en cocina"
          description="Los nuevos pedidos confirmados aparecerán aquí automáticamente."
        />
      ) : (
        <Grid container spacing={2}>
          {kitchenOrders.map((order) => (
            <Grid key={order.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
              <KitchenOrderCard
                order={order}
                onStartPreparation={(o) => handleStatusChange(o, 'PREPARING')}
                onMarkReady={(o) => handleStatusChange(o, 'READY')}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
