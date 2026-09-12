import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

interface ReopenSessionDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (masterKey: string, reason: string) => void;
}

/** "Rectificar caja" — reopens a closed session for correction. Requires the admin master key. */
export default function ReopenSessionDialog({ open, loading, onClose, onConfirm }: ReopenSessionDialogProps) {
  const [masterKey, setMasterKey] = useState('');
  const [reason, setReason] = useState('');

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMasterKey('');
      setReason('');
    }
  }

  const canConfirm = masterKey.trim() !== '' && reason.trim().length >= 5;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Rectificar caja</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esto reabrirá una caja ya cerrada para corregirla. La caja de hoy no se ve afectada — podrás
          seguir operando normalmente mientras corriges esta sesión.
        </Alert>
        <Stack spacing={2}>
          <TextField
            label="Motivo de la corrección"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            autoFocus
            helperText="Explica brevemente qué faltó o qué se va a corregir (mínimo 5 caracteres)."
          />
          <TextField
            label="Clave maestra de administrador"
            type="password"
            value={masterKey}
            onChange={(e) => setMasterKey(e.target.value)}
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
          color="warning"
          disabled={!canConfirm || loading}
          onClick={() => onConfirm(masterKey, reason)}
        >
          Reabrir para corregir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
