import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { KeyRound, Search } from 'lucide-react';
import { useSnackbar } from 'notistack';
import StatusChip from '../../../shared/components/common/StatusChip';
import CredentialsRevealDialog from '../../../shared/features/employees/components/CredentialsRevealDialog';
import { useResetUserPassword } from '../../../modules/businesses/hooks/use-reset-user-password';
import { normalizeApiError } from '../../../shared/lib/api/api-error';
import type { BusinessUserSummary } from '../../../modules/businesses/types/platform-admin.types';

/** Searching starts to make sense with this many users. */
const SEARCH_FROM = 6;

/**
 * A business's users, and resetting a user's password: a temporary one,
 * shown once, that the person changes for their own on signing in (the POS
 * asks for it). Their open sessions end.
 */
export default function BusinessUsersTable({
  businessId,
  users,
}: {
  businessId: string;
  users: BusinessUserSummary[];
}) {
  const { enqueueSnackbar } = useSnackbar();
  const resetPassword = useResetUserPassword(businessId);
  const [query, setQuery] = useState('');
  const [confirmFor, setConfirmFor] = useState<BusinessUserSummary | null>(null);
  const [revealed, setRevealed] = useState<{ email: string; password: string } | null>(null);

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? users.filter((user) =>
        [user.firstName, user.lastName, user.email, user.roleName].join(' ').toLowerCase().includes(needle),
      )
    : users;

  const reset = () => {
    const user = confirmFor;
    if (!user) return;
    resetPassword.mutate(user.id, {
      onSuccess: (data) => {
        setConfirmFor(null);
        setRevealed({ email: user.email, password: data.temporaryPassword });
      },
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
    });
  };

  return (
    <>
      {users.length >= SEARCH_FROM && (
        <TextField
          size="small"
          placeholder="Buscar por nombre, correo o rol"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 1.5, width: { xs: '100%', sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Contraseña</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((user) => (
              <TableRow key={user.id}>
                <TableCell sx={{ fontWeight: 600 }}>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.roleName}</TableCell>
                <TableCell>
                  <StatusChip
                    label={user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    tone={user.status === 'ACTIVE' ? 'success' : 'neutral'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<KeyRound size={14} />}
                    onClick={() => setConfirmFor(user)}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Restablecer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    {users.length === 0 ? 'Esta empresa aún no tiene usuarios.' : 'Ningún usuario coincide con la búsqueda.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={Boolean(confirmFor)} onClose={() => setConfirmFor(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Restablecer contraseña</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            ¿Restablecer la contraseña de{' '}
            <strong>
              {confirmFor?.firstName} {confirmFor?.lastName}
            </strong>{' '}
            ({confirmFor?.email})?
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Se genera una contraseña temporal que verás una sola vez.</li>
              <li>Al entrar con ella, el sistema le pedirá crear su propia contraseña.</li>
              <li>Se cierran las sesiones que tenga abiertas (celular, tablet o computador).</li>
            </ul>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmFor(null)} disabled={resetPassword.isPending}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={reset} loading={resetPassword.isPending}>
            Restablecer
          </Button>
        </DialogActions>
      </Dialog>

      <CredentialsRevealDialog
        open={Boolean(revealed)}
        email={revealed?.email}
        temporaryPassword={revealed?.password ?? null}
        onClose={() => setRevealed(null)}
      />
    </>
  );
}
