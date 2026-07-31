import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FormDrawer from '../../../components/common/FormDrawer';
import type { InventoryItem } from '../../../modules/inventory/types/inventory.types';

interface InventoryMovementDrawerProps {
  open: boolean;
  loading?: boolean;
  items: InventoryItem[];
  stockByItemId: Map<string, number>;
  defaultItemId?: string;
  onClose: () => void;
  onSubmit: (values: { inventoryItemId: string; direction: 'IN' | 'OUT'; quantity: number; reason: string }) => void;
}

export default function InventoryMovementDrawer({
  open,
  loading,
  items,
  stockByItemId,
  defaultItemId,
  onClose,
  onSubmit,
}: InventoryMovementDrawerProps) {
  const [itemId, setItemId] = useState(defaultItemId ?? '');
  const [direction, setDirection] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  // Reset the form fields when the drawer transitions from closed to open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setItemId(defaultItemId ?? '');
      setDirection('IN');
      setQuantity('');
      setReason('');
    }
  }

  const selectedItem = items.find((i) => i.id === itemId);
  const quantityNumber = Number(quantity);
  const isValid = Boolean(itemId) && reason.trim().length > 2 && quantityNumber > 0;

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      title="Ajustar stock"
      submitLabel="Registrar ajuste"
      submitDisabled={!isValid}
      loading={loading}
      onSubmit={() => {
        if (!isValid) return;
        onSubmit({ inventoryItemId: itemId, direction, quantity: quantityNumber, reason });
      }}
    >
      <Stack spacing={2.5}>
        <TextField select label="Insumo" value={itemId} onChange={(e) => setItemId(e.target.value)} fullWidth>
          {items.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name} ({stockByItemId.get(item.id) ?? 0} {item.unit} disp.)
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Dirección del ajuste"
          value={direction}
          onChange={(e) => setDirection(e.target.value as 'IN' | 'OUT')}
          fullWidth
        >
          <MenuItem value="IN">Entrada (suma stock)</MenuItem>
          <MenuItem value="OUT">Salida (resta stock)</MenuItem>
        </TextField>

        <TextField
          label={`Cantidad${selectedItem ? ` (${selectedItem.unit})` : ''}`}
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
        />

        <TextField
          label="Motivo / observación"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />

        {selectedItem && (
          <Alert severity="info" variant="outlined">
            <Typography variant="caption">
              Stock actual: {stockByItemId.get(selectedItem.id) ?? 0} {selectedItem.unit} · Mínimo:{' '}
              {selectedItem.minimumStock} {selectedItem.unit}
            </Typography>
          </Alert>
        )}
      </Stack>
    </FormDrawer>
  );
}
