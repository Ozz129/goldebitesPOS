import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormDrawer from '../../../components/common/FormDrawer';
import { useInventoryItems } from '../../../modules/inventory/hooks/use-inventory-items';
import { formatCOP } from '../../../utils/format';
import { WASTE_REASON_LABELS } from '../types';

interface WasteFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: { inventoryItemId: string; quantity: number; reason: string; notes?: string }) => void;
}

export default function WasteFormDrawer({ open, loading, onClose, onSubmit }: WasteFormDrawerProps) {
  const { data: itemsData } = useInventoryItems({ limit: 100, isActive: true });
  const items = itemsData?.data ?? [];

  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(Object.values(WASTE_REASON_LABELS)[0]);
  const [notes, setNotes] = useState('');

  // Reset the form fields when the drawer transitions from closed to open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setItemId('');
      setQuantity('');
      setReason(Object.values(WASTE_REASON_LABELS)[0]);
      setNotes('');
    }
  }

  const item = items.find((i) => i.id === itemId);
  const estimatedValue = item ? item.currentCost * Number(quantity || 0) : 0;
  const isValid = Boolean(itemId) && Number(quantity) > 0;

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      title="Registrar merma"
      submitLabel="Registrar merma"
      submitDisabled={!isValid}
      loading={loading}
      onSubmit={() => {
        if (!isValid) return;
        onSubmit({ inventoryItemId: itemId, quantity: Number(quantity), reason, notes: notes || undefined });
      }}
    >
      <Stack spacing={2.5}>
        <TextField select label="Insumo" value={itemId} onChange={(e) => setItemId(e.target.value)} fullWidth>
          {items.map((i) => (
            <MenuItem key={i.id} value={i.id}>
              {i.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={`Cantidad${item ? ` (${item.unit})` : ''}`}
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
        />
        <TextField select label="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth>
          {Object.values(WASTE_REASON_LABELS).map((label) => (
            <MenuItem key={label} value={label}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Observaciones"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
        {item && quantity && (
          <Typography variant="body2" color="text.secondary">
            Valor estimado de la pérdida: <strong>{formatCOP(estimatedValue)}</strong>
          </Typography>
        )}
      </Stack>
    </FormDrawer>
  );
}
