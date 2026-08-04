import { useEffect, useId, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Divider from '@mui/material/Divider';
import { Plus, Trash2, CircleCheck, CircleX } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useCreatePayment } from '../../../modules/orders/hooks/use-create-payment';
import { normalizeApiError } from '../../../lib/api/api-error';
import { PAYMENT_METHOD_LABELS } from '../../../modules/orders/order-status';
import { formatCOP } from '../../../utils/format';
import type { PaymentMethod } from '../../../modules/orders/types/payment.types';

interface SplitRow {
  key: string;
  amount: string;
  paymentMethod: PaymentMethod;
  payerLabel: string;
  status: 'idle' | 'pending' | 'success' | 'error';
}

interface SplitBillDialogProps {
  open: boolean;
  orderId: string;
  balanceDue: number;
  onClose: () => void;
  onDone: () => void;
}

function emptyRow(index: number): SplitRow {
  return {
    key: `row-${index}-${Date.now()}`,
    amount: '',
    paymentMethod: 'CASH',
    payerLabel: '',
    status: 'idle',
  };
}

/** Splits balanceDue (in whole pesos) into n shares that sum back exactly, remainder on the last share. */
function splitEqually(balanceDue: number, n: number): number[] {
  const totalCents = Math.round(balanceDue * 100);
  const baseCents = Math.floor(totalCents / n);
  const remainderCents = totalCents - baseCents * n;
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? baseCents + remainderCents : baseCents) / 100);
}

export default function SplitBillDialog({ open, orderId, balanceDue, onClose, onDone }: SplitBillDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const createPayment = useCreatePayment();
  const [mode, setMode] = useState<'equal' | 'custom'>('equal');
  const [numPeople, setNumPeople] = useState(2);
  const [rows, setRows] = useState<SplitRow[]>([emptyRow(0), emptyRow(1)]);
  const [submitting, setSubmitting] = useState(false);
  const idPrefix = useId();

  useEffect(() => {
    if (!open) return;
    setSubmitting(false);
    if (mode === 'equal') {
      const shares = splitEqually(balanceDue, numPeople);
      setRows(shares.map((amount, i) => ({ ...emptyRow(i), amount: String(amount) })));
    } else {
      setRows([emptyRow(0), emptyRow(1)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, numPeople]);

  const assigned = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const remaining = Math.round((balanceDue - assigned) * 100) / 100;
  const canSubmit = rows.length > 0 && Math.abs(remaining) < 0.01 && rows.every((r) => Number(r.amount) > 0);

  const updateRow = (key: string, patch: Partial<SplitRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    for (const row of rows) {
      if (row.status === 'success') continue;
      updateRow(row.key, { status: 'pending' });
      try {
        await createPayment.mutateAsync({
          orderId,
          payload: {
            paymentMethod: row.paymentMethod,
            amount: Number(row.amount),
            payerLabel: row.payerLabel || undefined,
          },
        });
        updateRow(row.key, { status: 'success' });
      } catch (error) {
        updateRow(row.key, { status: 'error' });
        enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' });
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(false);
    enqueueSnackbar('Cuenta dividida y pagada correctamente', { variant: 'success' });
    onDone();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Dividir cuenta</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Saldo pendiente: <strong>{formatCOP(balanceDue)}</strong>
          </Typography>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={mode}
            onChange={(_e, value) => value && setMode(value)}
          >
            <ToggleButton value="equal">Partes iguales</ToggleButton>
            <ToggleButton value="custom">Montos personalizados</ToggleButton>
          </ToggleButtonGroup>

          {mode === 'equal' && (
            <TextField
              label="¿Entre cuántas personas?"
              type="number"
              size="small"
              value={numPeople}
              onChange={(e) => setNumPeople(Math.max(2, Number(e.target.value) || 2))}
              slotProps={{ htmlInput: { min: 2 } }}
              sx={{ maxWidth: 220 }}
            />
          )}

          <Divider />

          <Stack spacing={1.5}>
            {rows.map((row, index) => (
              <Stack key={row.key} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <TextField
                  size="small"
                  label={`Persona ${index + 1}`}
                  placeholder="Nombre (opcional)"
                  value={row.payerLabel}
                  onChange={(e) => updateRow(row.key, { payerLabel: e.target.value })}
                  disabled={row.status === 'success' || submitting}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Monto"
                  type="number"
                  value={row.amount}
                  onChange={(e) => updateRow(row.key, { amount: e.target.value })}
                  disabled={mode === 'equal' || row.status === 'success' || submitting}
                  sx={{ width: 130 }}
                />
                <TextField
                  select
                  size="small"
                  label="Método"
                  value={row.paymentMethod}
                  onChange={(e) => updateRow(row.key, { paymentMethod: e.target.value as PaymentMethod })}
                  disabled={row.status === 'success' || submitting}
                  sx={{ width: 140 }}
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <MenuItem key={`${idPrefix}-${value}`} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                {row.status === 'success' && <CircleCheck size={18} color="#4CAF6D" />}
                {row.status === 'error' && <CircleX size={18} color="#D9534F" />}
                {mode === 'custom' && rows.length > 2 && row.status !== 'success' && (
                  <IconButton
                    size="small"
                    disabled={submitting}
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>

          {mode === 'custom' && (
            <Button
              size="small"
              startIcon={<Plus size={14} />}
              onClick={() => setRows((prev) => [...prev, emptyRow(prev.length)])}
              disabled={submitting}
              sx={{ alignSelf: 'flex-start' }}
            >
              Agregar persona
            </Button>
          )}

          <Typography
            variant="body2"
            color={Math.abs(remaining) < 0.01 ? 'success.main' : 'text.secondary'}
            sx={{ fontWeight: 600 }}
          >
            {Math.abs(remaining) < 0.01
              ? 'Los montos cuadran con el saldo pendiente.'
              : remaining > 0
                ? `Falta por asignar: ${formatCOP(remaining)}`
                : `Te pasaste por: ${formatCOP(-remaining)}`}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={submitting}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || submitting} loading={submitting}>
          Confirmar división
        </Button>
      </DialogActions>
    </Dialog>
  );
}
