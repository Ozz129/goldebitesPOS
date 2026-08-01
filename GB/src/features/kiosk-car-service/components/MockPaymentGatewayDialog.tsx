import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { CreditCard, CheckCircle2, Banknote } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { formatCOP } from '../../../utils/format';
import { useCreatePayment } from '../../../modules/orders/hooks/use-create-payment';
import { normalizeApiError } from '../../../lib/api/api-error';

interface MockPaymentGatewayDialogProps {
  open: boolean;
  order: { id: string; orderNumber: number; totalAmount: number } | null;
  onClose: () => void;
  onPaid: () => void;
}

type GatewayStage = 'idle' | 'connecting' | 'processing' | 'approved';

function randomAuthCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `AUTH-${code}`;
}

export default function MockPaymentGatewayDialog({
  open,
  order,
  onClose,
  onPaid,
}: MockPaymentGatewayDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [stage, setStage] = useState<GatewayStage>('idle');
  const [authCode, setAuthCode] = useState('');
  const [wasOpen, setWasOpen] = useState(false);
  const createPayment = useCreatePayment();

  if (open && !wasOpen) {
    setWasOpen(true);
    setStage('idle');
    setAuthCode('');
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  if (!order) return null;

  function registerPayment(paymentMethod: 'CARD' | 'CASH', reference?: string) {
    createPayment.mutate(
      { orderId: order!.id, payload: { paymentMethod, amount: order!.totalAmount, reference } },
      {
        onSuccess: () => onPaid(),
        onError: (error) => {
          enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' });
          setStage('idle');
        },
      },
    );
  }

  function handleCardCharge() {
    setStage('connecting');
    setTimeout(() => {
      setStage('processing');
      setTimeout(() => {
        const code = randomAuthCode();
        setAuthCode(code);
        setStage('approved');
        registerPayment('CARD', code);
      }, 1200);
    }, 600);
  }

  function handleCashCharge() {
    setAuthCode('Efectivo');
    setStage('approved');
    registerPayment('CASH');
  }

  return (
    <Dialog open={open} onClose={stage === 'idle' ? onClose : undefined} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Cobrar pedido #{order.orderNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1, alignItems: 'center', textAlign: 'center' }}>
          <Alert severity="info" sx={{ width: '100%' }}>
            Pasarela simulada — no procesa pagos reales.
          </Alert>

          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {formatCOP(order.totalAmount)}
          </Typography>

          {stage === 'idle' && (
            <Stack spacing={1.5} sx={{ width: '100%' }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<CreditCard size={18} />}
                onClick={handleCardCharge}
                sx={{ py: 1.5 }}
              >
                Cobrar con tarjeta
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<Banknote size={16} />}
                onClick={handleCashCharge}
                loading={createPayment.isPending}
              >
                Cobrar en efectivo
              </Button>
            </Stack>
          )}

          {(stage === 'connecting' || stage === 'processing') && (
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                {stage === 'connecting' ? 'Conectando con la pasarela…' : 'Procesando pago…'}
              </Typography>
            </Stack>
          )}

          {stage === 'approved' && (
            <Stack spacing={2} sx={{ alignItems: 'center', py: 1, width: '100%' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CheckCircle2 size={22} color="#4CAF6D" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Pago aprobado
                </Typography>
              </Stack>

              <Box
                sx={{
                  width: '100%',
                  borderRadius: 4,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                  py: 3,
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 800, letterSpacing: 2, display: 'block' }}
                >
                  Número de pedido
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '4rem', lineHeight: 1, color: 'primary.main' }}>
                  #{order.orderNumber}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Dale este número al cliente para ubicar su pedido cuando esté listo.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                Referencia de pago: {authCode}
              </Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={stage === 'connecting' || stage === 'processing'}>
          {stage === 'approved' ? 'Listo, siguiente carro' : 'Cancelar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
