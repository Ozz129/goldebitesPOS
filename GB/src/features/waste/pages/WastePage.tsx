import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, TrendingDown, Calendar, CalendarDays } from 'lucide-react';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import DataTable from '../../../components/common/DataTable';
import DateDisplay from '../../../components/common/DateDisplay';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import ErrorState from '../../../components/common/ErrorState';
import { Can } from '../../../modules/auth/components/can';
import { useAuthStore } from '../../../modules/auth/store/auth.store';
import { useWasteRecords } from '../../../modules/waste/hooks/use-waste-records';
import { useCreateWasteRecord } from '../../../modules/waste/hooks/use-create-waste-record';
import { normalizeApiError } from '../../../lib/api/api-error';
import { formatCOP } from '../../../utils/format';
import type { WasteRecord } from '../../../modules/waste/types/waste-record.types';
import WasteFormDrawer from '../components/WasteFormDrawer';

function isWithinDays(dateIso: string, days: number): boolean {
  const diff = Date.now() - new Date(dateIso).getTime();
  return diff <= days * 24 * 60 * 60 * 1000;
}

export default function WastePage() {
  const { enqueueSnackbar } = useSnackbar();
  const branchId = useAuthStore((s) => s.user?.branchId ?? null);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useWasteRecords({ limit: 100 });
  const createRecord = useCreateWasteRecord();

  const records = useMemo(() => data?.data ?? [], [data]);

  const { valueToday, valueWeek, valueMonth } = useMemo(() => {
    const value = (days: number) =>
      records
        .filter((r) => isWithinDays(r.createdAt, days))
        .reduce((sum, r) => sum + r.quantity * (r.unitCost ?? 0), 0);
    return { valueToday: value(1), valueWeek: value(7), valueMonth: value(30) };
  }, [records]);

  const columns: ColumnDef<WasteRecord, unknown>[] = [
    {
      id: 'createdAt',
      header: 'Fecha',
      cell: ({ row }) => <DateDisplay value={row.original.createdAt} mode="datetime" variant="body2" />,
    },
    { accessorKey: 'inventoryItemName', header: 'Insumo' },
    { accessorKey: 'quantity', header: 'Cantidad' },
    { accessorKey: 'reason', header: 'Motivo' },
    {
      id: 'estimatedValue',
      header: 'Valor estimado',
      cell: ({ row }) => (
        <CurrencyDisplay
          value={row.original.quantity * (row.original.unitCost ?? 0)}
          variant="body2"
          sx={{ fontWeight: 700 }}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Mermas"
        subtitle="Registro y control de pérdidas de insumos."
        breadcrumbs={[{ label: 'Mermas' }]}
        actions={
          <Can permission="inventory.adjust">
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
              Registrar merma
            </Button>
          </Can>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Valor perdido hoy" value={formatCOP(valueToday)} icon={TrendingDown} accent="#D9534F" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Valor perdido esta semana" value={formatCOP(valueWeek)} icon={Calendar} accent="#D9A441" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Valor perdido este mes" value={formatCOP(valueMonth)} icon={CalendarDays} />
        </Grid>
      </Grid>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          isLoading={isLoading}
          emptyTitle="No hay mermas registradas"
          emptyDescription="Registra una merma para comenzar el control de pérdidas."
          pageSize={10}
        />
      )}

      <WasteFormDrawer
        open={formOpen}
        loading={createRecord.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={(input) => {
          if (!branchId) {
            enqueueSnackbar('Tu usuario no tiene una sucursal asignada.', { variant: 'error' });
            return;
          }
          createRecord.mutate(
            { branchId, ...input },
            {
              onSuccess: () => {
                enqueueSnackbar('Merma registrada correctamente', { variant: 'success' });
                setFormOpen(false);
              },
              onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
            },
          );
        }}
      />
    </>
  );
}
