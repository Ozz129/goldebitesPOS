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
import { getRoleLabel } from '../../../modules/roles/role-labels';

interface GenerateCredentialsDialogProps {
  open: boolean;
  loading?: boolean;
  defaultRoleId?: string | null;
  onClose: () => void;
  onSubmit: (values: { roleId: string }) => void;
}

export default function GenerateCredentialsDialog({
  open,
  loading = false,
  defaultRoleId,
  onClose,
  onSubmit,
}: GenerateCredentialsDialogProps) {
  const { data: roles } = useRoles();
  const [roleId, setRoleId] = useState('');
  const [touched, setTouched] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);

  if (open && !wasOpen) {
    setWasOpen(true);
    setRoleId(defaultRoleId ?? '');
    setTouched(false);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const canSubmit = Boolean(roleId);

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({ roleId });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Generar acceso al sistema</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Se creará automáticamente un usuario a partir del nombre del empleado, con la
            contraseña por defecto — se le pedirá cambiarla en su primer ingreso.
          </Typography>
          <TextField
            select
            label="Rol"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            error={touched && !roleId}
            helperText={touched && !roleId ? 'Selecciona un rol' : undefined}
            autoFocus
            fullWidth
          >
            {(roles ?? []).map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {getRoleLabel(role.name)}
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
