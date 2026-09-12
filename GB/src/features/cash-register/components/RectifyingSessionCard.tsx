import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusCircle, Lock } from 'lucide-react';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import DataTable from '../../../components/common/DataTable';
import { useCashSession } from '../../../modules/cash-sessions/hooks/use-cash-session';
import type { CashMovement, CashSession } from '../../../modules/cash-sessions/types/cash-session.types';

interface RectifyingSessionCardProps {
  session: CashSession;
  movementColumns: ColumnDef<CashMovement, unknown>[];
  onAddMovement: () => void;
  onCloseCorrection: () => void;
}

/** Shown for a session an admin reopened for correction ("rectificar caja") — runs in parallel with today's open session. */
export default function RectifyingSessionCard({
  session,
  movementColumns,
  onAddMovement,
  onCloseCorrection,
}: RectifyingSessionCardProps) {
  const { data: detail } = useCashSession(session.id);

  return (
    <Card sx={{ mb: 3, borderColor: 'warning.main', borderWidth: 2, borderStyle: 'solid' }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <StatusChip label="En corrección" tone="warning" />
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<PlusCircle size={15} />} onClick={onAddMovement}>
              Agregar movimiento
            </Button>
            <Button
              size="small"
              variant="contained"
              color="warning"
              startIcon={<Lock size={15} />}
              onClick={onCloseCorrection}
            >
              Cerrar corrección
            </Button>
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary" component="div" sx={{ mb: 1.5 }}>
          Sesión original abierta el{' '}
          <DateDisplay value={session.openedAt} mode="datetime" component="span" sx={{ fontWeight: 600 }} />
        </Typography>
        <DataTable
          columns={movementColumns}
          data={detail?.movements ?? []}
          emptyTitle="Sin movimientos"
          emptyDescription="Agrega el ajuste que faltaba antes de volver a cerrar esta sesión."
          pageSize={5}
        />
      </CardContent>
    </Card>
  );
}
