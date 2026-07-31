import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import type { ColumnDef } from '@tanstack/react-table';
import { useSnackbar } from 'notistack';
import { Wallet, PlusCircle, Lock, Banknote, ReceiptText } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import { Can } from '../../../modules/auth/components/can';
import { useAuthStore } from '../../../modules/auth/store/auth.store';
import { useCurrentCashSession } from '../../../modules/cash-sessions/hooks/use-current-cash-session';
import { useCashSessions } from '../../../modules/cash-sessions/hooks/use-cash-sessions';
import { useOpenCashSession } from '../../../modules/cash-sessions/hooks/use-open-cash-session';
import { useCloseCashSession } from '../../../modules/cash-sessions/hooks/use-close-cash-session';
import { useAddCashMovement } from '../../../modules/cash-sessions/hooks/use-add-cash-movement';
import { normalizeApiError } from '../../../lib/api/api-error';
import { formatCOP } from '../../../utils/format';
import type {
  CashMovement,
  CashMovementType,
  CashSession,
} from '../../../modules/cash-sessions/types/cash-session.types';
import OpenSessionDialog from '../components/OpenSessionDialog';
import CloseSessionDialog from '../components/CloseSessionDialog';
import CashMovementDrawer from '../components/CashMovementDrawer';

const MOVEMENT_TYPE_LABELS: Record<CashMovementType, string> = {
  OPENING: 'Apertura',
  SALE: 'Venta',
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  WITHDRAWAL: 'Retiro',
  CLOSING: 'Cierre',
};

const POSITIVE_MOVEMENT_TYPES: CashMovementType[] = ['OPENING', 'SALE', 'INCOME'];

export default function CashRegisterPage() {
  const { enqueueSnackbar } = useSnackbar();
  const branchId = useAuthStore((s) => s.user?.branchId ?? null);

  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [movementDrawerOpen, setMovementDrawerOpen] = useState(false);

  const {
    data: currentSession,
    isLoading,
    isError,
    hasNoOpenSession,
    refetch,
  } = useCurrentCashSession(branchId);
  const { data: historyData } = useCashSessions({ limit: 20, status: 'CLOSED' });
  const openSession = useOpenCashSession();
  const closeSession = useCloseCashSession();
  const addMovement = useAddCashMovement(branchId);

  const closedSessions = historyData?.data ?? [];

  const cashSales = useMemo(
    () => (currentSession?.movements ?? []).filter((m) => m.movementType === 'SALE'),
    [currentSession],
  );
  const totalCashSales = cashSales.reduce((sum, m) => sum + m.amount, 0);
  const manualMovements = useMemo(
    () =>
      (currentSession?.movements ?? []).filter((m) =>
        (['INCOME', 'EXPENSE', 'WITHDRAWAL'] as CashMovementType[]).includes(m.movementType),
      ),
    [currentSession],
  );

  const movementColumns: ColumnDef<CashMovement, unknown>[] = [
    {
      id: 'createdAt',
      header: 'Fecha',
      cell: ({ row }) => <DateDisplay value={row.original.createdAt} mode="datetime" variant="body2" />,
    },
    {
      id: 'type',
      header: 'Tipo',
      cell: ({ row }) => (
        <StatusChip
          label={MOVEMENT_TYPE_LABELS[row.original.movementType]}
          tone={POSITIVE_MOVEMENT_TYPES.includes(row.original.movementType) ? 'success' : 'warning'}
        />
      ),
    },
    { accessorKey: 'description', header: 'Descripción', cell: ({ row }) => row.original.description ?? '—' },
    {
      accessorKey: 'amount',
      header: 'Monto',
      cell: ({ row }) => (
        <CurrencyDisplay
          value={POSITIVE_MOVEMENT_TYPES.includes(row.original.movementType) ? row.original.amount : -row.original.amount}
          variant="body2"
          sx={{ fontWeight: 700 }}
        />
      ),
    },
  ];

  const historyColumns: ColumnDef<CashSession, unknown>[] = [
    {
      id: 'openedAt',
      header: 'Apertura',
      cell: ({ row }) => <DateDisplay value={row.original.openedAt} mode="datetime" variant="body2" />,
    },
    {
      id: 'closedAt',
      header: 'Cierre',
      cell: ({ row }) => (row.original.closedAt ? <DateDisplay value={row.original.closedAt} mode="datetime" variant="body2" /> : '—'),
    },
    { accessorKey: 'openingAmount', header: 'Base inicial', cell: ({ getValue }) => formatCOP(getValue<number>()) },
    {
      id: 'actualClosingAmount',
      header: 'Efectivo contado',
      cell: ({ row }) =>
        row.original.actualClosingAmount !== null ? formatCOP(row.original.actualClosingAmount) : '—',
    },
    {
      id: 'differenceAmount',
      header: 'Diferencia',
      cell: ({ row }) =>
        row.original.differenceAmount !== null ? (
          <Typography
            variant="body2"
            color={row.original.differenceAmount === 0 ? 'success.main' : 'error.main'}
            sx={{ fontWeight: 700 }}
          >
            {formatCOP(row.original.differenceAmount)}
          </Typography>
        ) : (
          '—'
        ),
    },
  ];

  if (!branchId) {
    return (
      <>
        <PageHeader title="Caja" breadcrumbs={[{ label: 'Caja' }]} />
        <EmptyState
          icon={Wallet}
          title="Tu usuario no tiene una sucursal asignada"
          description="Contacta a un administrador para asignarte una sucursal y poder operar la caja."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Caja"
        subtitle="Apertura, movimientos y cuadre de caja por turno."
        breadcrumbs={[{ label: 'Caja' }]}
        actions={
          currentSession ? (
            <Can permission="cash.close">
              <Button
                variant="outlined"
                startIcon={<PlusCircle size={16} />}
                onClick={() => setMovementDrawerOpen(true)}
              >
                Registrar movimiento
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Lock size={16} />}
                onClick={() => setCloseDialogOpen(true)}
              >
                Cerrar caja
              </Button>
            </Can>
          ) : (
            <Can permission="cash.open">
              <Button variant="contained" startIcon={<Wallet size={16} />} onClick={() => setOpenDialogOpen(true)}>
                Abrir caja
              </Button>
            </Can>
          )
        }
      />

      {isLoading ? (
        <LoadingSkeleton variant="page" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : hasNoOpenSession || !currentSession ? (
        <EmptyState
          icon={Wallet}
          title="La caja está cerrada"
          description="Abre un nuevo turno registrando la base inicial para comenzar a operar."
          actionLabel="Abrir caja"
          onAction={() => setOpenDialogOpen(true)}
        />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Base inicial" value={formatCOP(currentSession.openingAmount)} icon={Wallet} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Ventas en efectivo" value={formatCOP(totalCashSales)} icon={Banknote} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Ventas del turno"
                value={String(cashSales.length)}
                icon={ReceiptText}
                helperText="Pagos en efectivo registrados"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Movimientos manuales" value={String(manualMovements.length)} icon={PlusCircle} />
            </Grid>
          </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <StatusChip label="Caja abierta" tone="success" />
              </Stack>
              <Typography variant="body2" color="text.secondary" component="div">
                Abierta el{' '}
                <DateDisplay
                  value={currentSession.openedAt}
                  mode="datetime"
                  component="span"
                  sx={{ fontWeight: 600 }}
                />
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Movimientos del turno actual
            </Typography>
          </Box>
          <DataTable
            columns={movementColumns}
            data={currentSession.movements}
            emptyTitle="Sin movimientos registrados"
            emptyDescription="Los ingresos, egresos y retiros del turno aparecerán aquí."
            pageSize={8}
          />
        </>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          Historial de sesiones
        </Typography>
        <DataTable
          columns={historyColumns}
          data={closedSessions}
          emptyTitle="Aún no hay sesiones cerradas"
          emptyDescription="El historial de cierres de caja aparecerá aquí."
          pageSize={8}
        />
      </Box>

      <OpenSessionDialog
        open={openDialogOpen}
        loading={openSession.isPending}
        onClose={() => setOpenDialogOpen(false)}
        onConfirm={(amount) => {
          openSession.mutate(
            { branchId, openingAmount: amount },
            {
              onSuccess: () => {
                setOpenDialogOpen(false);
                enqueueSnackbar('Caja abierta correctamente', { variant: 'success' });
              },
              onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
            },
          );
        }}
      />

      <CloseSessionDialog
        open={closeDialogOpen}
        loading={closeSession.isPending}
        onClose={() => setCloseDialogOpen(false)}
        onConfirm={(actualClosingAmount, notes) => {
          if (!currentSession) return;
          closeSession.mutate(
            { id: currentSession.id, payload: { actualClosingAmount, notes: notes || undefined } },
            {
              onSuccess: (closed) => {
                setCloseDialogOpen(false);
                const diff = closed.differenceAmount ?? 0;
                enqueueSnackbar(
                  diff === 0
                    ? 'Caja cerrada correctamente. Cuadre exacto.'
                    : `Caja cerrada. Diferencia de ${formatCOP(Math.abs(diff))} (${diff > 0 ? 'sobrante' : 'faltante'}).`,
                  { variant: diff === 0 ? 'success' : 'warning' },
                );
              },
              onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
            },
          );
        }}
      />

      <CashMovementDrawer
        open={movementDrawerOpen}
        loading={addMovement.isPending}
        onClose={() => setMovementDrawerOpen(false)}
        onSubmit={(values) => {
          if (!currentSession) return;
          addMovement.mutate(
            { id: currentSession.id, payload: values },
            {
              onSuccess: () => {
                setMovementDrawerOpen(false);
                enqueueSnackbar('Movimiento registrado correctamente', { variant: 'success' });
              },
              onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
            },
          );
        }}
      />
    </>
  );
}
