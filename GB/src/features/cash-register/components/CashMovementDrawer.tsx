import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormDrawer from '../../../components/common/FormDrawer';
import type { ManualCashMovementType } from '../../../modules/cash-sessions/types/cash-session.types';

const MANUAL_MOVEMENT_LABELS: Record<ManualCashMovementType, string> = {
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  WITHDRAWAL: 'Retiro',
};

interface CashMovementDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: { movementType: ManualCashMovementType; amount: number; description: string }) => void;
}

export default function CashMovementDrawer({ open, loading, onClose, onSubmit }: CashMovementDrawerProps) {
  const [movementType, setMovementType] = useState<ManualCashMovementType>('INCOME');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Reset the form fields when the drawer transitions from closed to open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMovementType('INCOME');
      setAmount('');
      setDescription('');
    }
  }

  const isValid = Number(amount) > 0 && description.trim().length > 2;

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      title="Registrar movimiento de caja"
      submitLabel="Registrar movimiento"
      submitDisabled={!isValid}
      loading={loading}
      onSubmit={() => {
        if (!isValid) return;
        onSubmit({ movementType, amount: Number(amount), description });
      }}
    >
      <Stack spacing={2.5}>
        <TextField
          select
          label="Tipo de movimiento"
          value={movementType}
          onChange={(e) => setMovementType(e.target.value as ManualCashMovementType)}
        >
          {Object.entries(MANUAL_MOVEMENT_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Monto (COP)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
        />
      </Stack>
    </FormDrawer>
  );
}
