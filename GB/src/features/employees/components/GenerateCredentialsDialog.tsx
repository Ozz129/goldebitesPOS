import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useRoles } from '../../../modules/roles/hooks/use-roles';

interface GenerateCredentialsDialogProps {
  open: boolean;
  loading?: boolean;
  defaultEmail?: string | null;
  onClose: () => void;
  onSubmit: (values: { email: string; roleId: string }) => void;
}

export default function GenerateCredentialsDialog({
  open,
  loading = false,
  defaultEmail,
  onClose,
  onSubmit,
}: GenerateCredentialsDialogProps) {
  const { data: roles } = useRoles();
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [touched, setTouched] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);

  if (open && !wasOpen) {
    setWasOpen(true);
    setEmail(defaultEmail ?? '');
    setRoleId('');
    setTouched(false);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const canSubmit = emailValid && Boolean(roleId);

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({ email, roleId });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Generar acceso al sistema</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Se creará una cuenta de acceso con una contraseña temporal, la cual solo se mostrará una vez.
          </Typography>
          <TextField
            label="Correo de acceso"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={touched && !emailValid}
            helperText={touched && !emailValid ? 'Ingresa un correo válido' : undefined}
            autoFocus
            fullWidth
          />
          <TextField
            select
            label="Rol"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            error={touched && !roleId}
            helperText={touched && !roleId ? 'Selecciona un rol' : undefined}
            fullWidth
          >
            {(roles ?? []).map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" loading={loading}>
          Generar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
