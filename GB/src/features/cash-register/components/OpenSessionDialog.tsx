import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useAuthStore } from '../../../modules/auth/store/auth.store';

interface OpenSessionDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (openingAmount: number) => void;
}

export default function OpenSessionDialog({ open, loading, onClose, onConfirm }: OpenSessionDialogProps) {
  const user = useAuthStore((s) => s.user);
  const [amount, setAmount] = useState('200000');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Apertura de caja</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Registra la base inicial con la que se abre el turno.
        </DialogContentText>
        <Stack spacing={2}>
          <TextField
            label="Base inicial (COP)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            fullWidth
          />
          <TextField
            label="Responsable"
            value={user ? `${user.firstName} ${user.lastName}` : ''}
            fullWidth
            disabled
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!(Number(amount) >= 0) || loading}
          onClick={() => onConfirm(Number(amount))}
        >
          Abrir caja
        </Button>
      </DialogActions>
    </Dialog>
  );
}
