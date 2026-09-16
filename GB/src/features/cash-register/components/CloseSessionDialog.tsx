import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import CurrencyField from '../../../components/common/CurrencyField';

interface CloseSessionDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (actualClosingAmount: number, actualTransferAmount: number | undefined, notes: string) => void;
}

export default function CloseSessionDialog({ open, loading, onClose, onConfirm }: CloseSessionDialogProps) {
  const [counted, setCounted] = useState<number | ''>('');
  const [transfers, setTransfers] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Reset the form fields when the dialog transitions from closed to open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setCounted('');
      setTransfers('');
      setNotes('');
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Cierre de caja</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Cuenta el efectivo físico en caja y, si lo verificas, el total recibido por transferencias. El
          sistema calculará la diferencia frente al valor esperado de cada uno al confirmar el cierre.
        </DialogContentText>
        <Stack spacing={2}>
          <CurrencyField
            label="Efectivo contado (COP)"
            value={counted}
            onChange={setCounted}
            autoFocus
            fullWidth
          />
          <CurrencyField
            label="Transferencias recibidas (COP, opcional)"
            value={transfers}
            onChange={setTransfers}
            helperText="Déjalo vacío si no vas a verificar las transferencias en este cierre."
            fullWidth
          />
          <TextField
            label="Observaciones del cierre"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={counted === '' || loading}
          onClick={() => onConfirm(Number(counted), transfers === '' ? undefined : Number(transfers), notes)}
        >
          Cerrar caja
        </Button>
      </DialogActions>
    </Dialog>
  );
}
