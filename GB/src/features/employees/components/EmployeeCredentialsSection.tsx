import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { KeyRound, RotateCcw, Lock, Unlock } from 'lucide-react';
import { useSnackbar } from 'notistack';
import StatusChip from '../../../components/common/StatusChip';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Can } from '../../../modules/auth/components/can';
import { useGenerateEmployeeCredentials } from '../../../modules/employees/hooks/use-generate-employee-credentials';
import { useResetEmployeeCredentials } from '../../../modules/employees/hooks/use-reset-employee-credentials';
import { useSetEmployeeCredentialsStatus } from '../../../modules/employees/hooks/use-set-employee-credentials-status';
import { normalizeApiError } from '../../../lib/api/api-error';
import { CREDENTIALS_STATUS_LABELS, CREDENTIALS_STATUS_TONE } from '../../../modules/employees/employee-status';
import type { EmployeeWithShifts } from '../../../modules/employees/types/employee.types';
import GenerateCredentialsDialog from './GenerateCredentialsDialog';
import CredentialsRevealDialog from './CredentialsRevealDialog';

interface EmployeeCredentialsSectionProps {
  employee: EmployeeWithShifts;
}

export default function EmployeeCredentialsSection({ employee }: EmployeeCredentialsSectionProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [confirmingResetOrBlock, setConfirmingResetOrBlock] = useState<'reset' | 'toggle' | null>(null);
  const [reveal, setReveal] = useState<{ email: string; password: string } | null>(null);

  const generateCredentials = useGenerateEmployeeCredentials();
  const resetCredentials = useResetEmployeeCredentials();
  const setCredentialsStatus = useSetEmployeeCredentialsStatus();

  const account = employee.userAccount;

  const handleGenerate = (values: { email: string; roleId: string }) => {
    generateCredentials.mutate(
      { id: employee.id, payload: values },
      {
        onSuccess: ({ employee: updated, temporaryPassword }) => {
          setGenerateOpen(false);
          setReveal({ email: updated.userAccount?.email ?? values.email, password: temporaryPassword });
          enqueueSnackbar('Acceso generado correctamente', { variant: 'success' });
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  const handleReset = () => {
    resetCredentials.mutate(employee.id, {
      onSuccess: (result) => {
        setConfirmingResetOrBlock(null);
        setReveal({ email: account?.email ?? '', password: result.temporaryPassword });
        enqueueSnackbar('Contraseña restablecida correctamente', { variant: 'success' });
      },
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
    });
  };

  const handleToggleStatus = () => {
    if (!account) return;
    const nextStatus = account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setCredentialsStatus.mutate(
      { id: employee.id, status: nextStatus },
      {
        onSuccess: () => {
          setConfirmingResetOrBlock(null);
          enqueueSnackbar(
            nextStatus === 'ACTIVE' ? 'Acceso activado' : 'Acceso desactivado',
            { variant: 'success' },
          );
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Acceso al sistema
      </Typography>

      {!account ? (
        <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Typography variant="body2" color="text.secondary">
            Este empleado aún no tiene credenciales de acceso.
          </Typography>
          <Can permission="employees.manage">
            <Button
              variant="outlined"
              size="small"
              startIcon={<KeyRound size={16} />}
              onClick={() => setGenerateOpen(true)}
            >
              Generar acceso
            </Button>
          </Can>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2">{account.email}</Typography>
            <StatusChip
              label={CREDENTIALS_STATUS_LABELS[account.status]}
              tone={CREDENTIALS_STATUS_TONE[account.status]}
            />
          </Stack>
          <Can permission="employees.manage">
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RotateCcw size={16} />}
                onClick={() => setConfirmingResetOrBlock('reset')}
              >
                Restablecer contraseña
              </Button>
              <Button
                variant="outlined"
                size="small"
                color={account.status === 'ACTIVE' ? 'error' : 'success'}
                startIcon={account.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                onClick={() => setConfirmingResetOrBlock('toggle')}
              >
                {account.status === 'ACTIVE' ? 'Desactivar acceso' : 'Activar acceso'}
              </Button>
            </Stack>
          </Can>
        </Stack>
      )}

      <GenerateCredentialsDialog
        open={generateOpen}
        loading={generateCredentials.isPending}
        defaultEmail={employee.email}
        onClose={() => setGenerateOpen(false)}
        onSubmit={handleGenerate}
      />

      <ConfirmDialog
        open={confirmingResetOrBlock === 'reset'}
        title="Restablecer contraseña"
        description="Se generará una nueva contraseña temporal y la anterior dejará de funcionar de inmediato. ¿Deseas continuar?"
        confirmLabel="Restablecer"
        loading={resetCredentials.isPending}
        onClose={() => setConfirmingResetOrBlock(null)}
        onConfirm={handleReset}
      />

      <ConfirmDialog
        open={confirmingResetOrBlock === 'toggle'}
        title={account?.status === 'ACTIVE' ? 'Desactivar acceso' : 'Activar acceso'}
        description={
          account?.status === 'ACTIVE'
            ? 'El empleado no podrá iniciar sesión mientras el acceso esté desactivado. ¿Deseas continuar?'
            : 'El empleado podrá volver a iniciar sesión con sus credenciales. ¿Deseas continuar?'
        }
        confirmLabel={account?.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
        destructive={account?.status === 'ACTIVE'}
        loading={setCredentialsStatus.isPending}
        onClose={() => setConfirmingResetOrBlock(null)}
        onConfirm={handleToggleStatus}
      />

      <CredentialsRevealDialog
        open={Boolean(reveal)}
        email={reveal?.email}
        temporaryPassword={reveal?.password ?? null}
        onClose={() => setReveal(null)}
      />
    </Box>
  );
}
