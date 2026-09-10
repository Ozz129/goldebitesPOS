import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { QrCode } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useCreateWompiQrCheckout } from '../../../modules/wompi/hooks/use-create-wompi-qr-checkout';
import { useConfirmWompiTransaction } from '../../../modules/wompi/hooks/use-confirm-wompi-transaction';
import { normalizeApiError } from '../../../lib/api/api-error';
import { announcePayment } from '../utils/announce-payment';
import type { WompiQrCheckout } from '../../../modules/wompi/types/wompi.types';

interface WompiQrCheckoutButtonProps {
  orderId: string;
  payerLabel?: string;
  onPaid: (amount: number) => void;
}

const POLL_INTERVAL_MS = 3000;

/** Simpler alternative to the Wompi widget: shows a scannable QR the customer pays from their own bank app. */
export default function WompiQrCheckoutButton({ orderId, payerLabel, onPaid }: WompiQrCheckoutButtonProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState<WompiQrCheckout | null>(null);
  const createQrCheckout = useCreateWompiQrCheckout(orderId);
  const confirmTransaction = useConfirmWompiTransaction(orderId);

  async function handleOpen() {
    setOpen(true);
    setCheckout(null);
    try {
      const result = await createQrCheckout.mutateAsync({ payerLabel });
      setCheckout(result);
    } catch (error) {
      enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' });
      setOpen(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setCheckout(null);
  }

  useEffect(() => {
    if (!checkout || !open) return undefined;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      if (cancelled || !checkout) return;
      try {
        const confirmed = await confirmTransaction.mutateAsync({
          reference: checkout.reference,
          payload: { wompiTransactionId: checkout.wompiTransactionId },
        });
        if (cancelled) return;

        if (confirmed.payment) {
          announcePayment(confirmed.payment.amount, enqueueSnackbar);
          onPaid(confirmed.payment.amount);
          handleClose();
          return;
        }
        if (confirmed.intent.status !== 'PENDING') {
          enqueueSnackbar('Wompi no aprobó el pago. Intenta de nuevo.', { variant: 'warning' });
          handleClose();
          return;
        }
      } catch {
        // Error de red transitorio consultando el estado — se reintenta en el siguiente ciclo.
      }
      if (!cancelled) {
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout, open]);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<QrCode size={15} />}
        loading={createQrCheckout.isPending}
        onClick={handleOpen}
      >
        Cobrar con QR
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cobrar con código QR</DialogTitle>
        <DialogContent>
          {!checkout ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Stack spacing={2} sx={{ alignItems: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Pide al cliente que escanee este código con su app bancaria (Bancolombia, Nequi, etc).
              </Typography>
              <Box
                component="img"
                src={`data:image/svg+xml;base64,${checkout.qrImage}`}
                alt="Código QR de pago"
                sx={{ width: 220, height: 220 }}
              />
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CircularProgress size={14} />
                <Typography variant="caption" color="text.secondary">
                  Esperando confirmación del pago...
                </Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
