import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import { Copy, Check } from 'lucide-react';
import { DEFAULT_EMPLOYEE_PASSWORD } from '../../../modules/employees/constants/default-password.constant';

interface NewAccountInfoDialogProps {
  open: boolean;
  email: string | null;
  onClose: () => void;
}

/** Shown after auto-provisioning a login (creation or the legacy "Generar acceso" flow) — the password is a known constant, not a secret, so unlike a reset this isn't a one-time reveal. */
export default function NewAccountInfoDialog({ open, email, onClose }: NewAccountInfoDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Acceso creado</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            Se le pedirá cambiar esta contraseña la primera vez que inicie sesión.
          </Alert>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.25,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {email}
            </Typography>
            <IconButton size="small" onClick={handleCopy} aria-label="Copiar usuario">
              {copied ? <Check size={16} color="#4CAF6D" /> : <Copy size={16} />}
            </IconButton>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Contraseña por defecto: <strong>{DEFAULT_EMPLOYEE_PASSWORD}</strong>
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained">
          Entendido, cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
