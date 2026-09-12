import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import { Landmark, RefreshCw, X } from 'lucide-react';
import { useBankTransferStatus } from '../../../modules/bank-transactions/hooks/use-bank-transfer-status';
import { useStartBankTransfer } from '../../../modules/bank-transactions/hooks/use-start-bank-transfer';
import { useRecheckBankTransfer } from '../../../modules/bank-transactions/hooks/use-recheck-bank-transfer';
import { useCancelBankTransfer } from '../../../modules/bank-transactions/hooks/use-cancel-bank-transfer';
import { useConfirmBankTransferManual } from '../../../modules/bank-transactions/hooks/use-confirm-bank-transfer-manual';
import { normalizeApiError } from '../../../lib/api/api-error';
import { formatCOP } from '../../../utils/format';
import { announcePayment } from '../utils/announce-payment';

interface BankTransferPanelProps {
  orderId: string;
  onConfirmed: (amount: number) => void;
}

/** "Cobrar con transferencia Bancolombia" — waits for and auto-verifies the transfer via email. */
export default function BankTransferPanel({ orderId, onConfirmed }: BankTransferPanelProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: status } = useBankTransferStatus(orderId, true);
  const start = useStartBankTransfer(orderId);
  const recheck = useRecheckBankTransfer(orderId);
  const cancel = useCancelBankTransfer(orderId);
  const confirmManual = useConfirmBankTransferManual(orderId);
  const previousState = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousState.current === 'WAITING' && status?.state === 'MATCHED') {
      announcePayment(status.request.amountExpected, enqueueSnackbar);
      onConfirmed(status.request.amountExpected);
    }
    previousState.current = status?.state;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.state]);

  if (!status || status.state === 'NONE') {
    return (
      <Button
        variant="outlined"
        startIcon={<Landmark size={15} />}
        loading={start.isPending}
        onClick={() =>
          start.mutate(undefined, {
            onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
          })
        }
      >
        Cobrar con transferencia Bancolombia
      </Button>
    );
  }

  if (status.state === 'MATCHED') {
    return null; // The payments list below already shows it — nothing more to render here.
  }

  return (
    <Box sx={{ p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <CircularProgress size={16} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Esperando transferencia...
        </Typography>
      </Stack>
      <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
        {formatCOP(status.request.amountExpected)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Verificando pago...
      </Typography>

      {status.reviewCandidates.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', fontWeight: 600 }}>
            Encontramos más de una transferencia que podría corresponder — revisión manual:
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 0.5 }}>
            {status.reviewCandidates.map((candidate) => (
              <Stack
                key={candidate.transactionId}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="caption">
                  {formatCOP(candidate.amount)} ·{' '}
                  {new Date(candidate.receivedAt).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {candidate.reference && ` · ref ${candidate.reference}`}
                </Typography>
                <Button
                  size="small"
                  disabled={confirmManual.isPending}
                  onClick={() =>
                    confirmManual.mutate(candidate.transactionId, {
                      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
                    })
                  }
                >
                  Confirmar
                </Button>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          size="small"
          startIcon={<RefreshCw size={13} />}
          loading={recheck.isPending}
          onClick={() =>
            recheck.mutate(undefined, {
              onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
            })
          }
        >
          Verificar nuevamente
        </Button>
        <Button
          size="small"
          color="inherit"
          startIcon={<X size={13} />}
          onClick={() => cancel.mutate()}
        >
          Cancelar
        </Button>
      </Stack>
    </Box>
  );
}
