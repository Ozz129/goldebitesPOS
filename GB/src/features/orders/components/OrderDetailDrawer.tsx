import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useSnackbar } from 'notistack';
import { MapPin, ArrowRight, Ban, CreditCard, Users } from 'lucide-react';
import DetailDrawer from '../../../components/common/DetailDrawer';
import StatusChip from '../../../components/common/StatusChip';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import DateDisplay from '../../../components/common/DateDisplay';
import { Can } from '../../../modules/auth/components/can';
import { useOrder } from '../../../modules/orders/hooks/use-order';
import { useOrderPayments } from '../../../modules/orders/hooks/use-order-payments';
import { useCreatePayment } from '../../../modules/orders/hooks/use-create-payment';
import { normalizeApiError } from '../../../lib/api/api-error';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import OrderTimer from './OrderTimer';
import SplitBillDialog from './SplitBillDialog';
import {
  nextStatusFor,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  PAYMENT_METHOD_LABELS,
  isOrderDelayed,
} from '../../../modules/orders/order-status';
import type { Order } from '../../../modules/orders/types/order.types';
import type { PaymentMethod } from '../../../modules/orders/types/payment.types';

interface OrderDetailDrawerProps {
  orderId: string | null;
  customerName: (order: Order) => string;
  onClose: () => void;
  onAdvance: (order: Order) => void;
  onCancel: (order: Order, reason: string) => void;
}

export default function OrderDetailDrawer({
  orderId,
  customerName,
  onClose,
  onAdvance,
  onCancel,
}: OrderDetailDrawerProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { data: order, isLoading } = useOrder(orderId);
  const { data: payments = [] } = useOrderPayments(orderId);
  const createPayment = useCreatePayment();

  if (!orderId) return null;

  if (isLoading || !order) {
    return (
      <DetailDrawer open={Boolean(orderId)} onClose={onClose} title="Cargando pedido...">
        <LoadingSkeleton variant="page" />
      </DetailDrawer>
    );
  }

  const next = nextStatusFor(order.status);
  const delayed = isOrderDelayed(order.status, order.createdAt);
  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(order.totalAmount - amountPaid, 0);
  const canRegisterPayment = order.status !== 'CANCELLED' && balanceDue > 0;

  const handleRegisterPayment = () => {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return;
    createPayment.mutate(
      { orderId: order.id, payload: { paymentMethod, amount } },
      {
        onSuccess: () => {
          enqueueSnackbar('Pago registrado correctamente', { variant: 'success' });
          setPaymentAmount('');
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  return (
    <>
      <DetailDrawer
        open={Boolean(order)}
        onClose={onClose}
        title={`Pedido #${order.orderNumber}`}
        subtitle={ORDER_TYPE_LABELS[order.orderType]}
        headerExtra={
          <StatusChip label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONE[order.status]} />
        }
        footer={
          order.status !== 'DELIVERED' && order.status !== 'CANCELLED' ? (
            <Can permission="orders.update">
              <Stack direction="row" spacing={1.5}>
                <Button color="error" startIcon={<Ban size={16} />} onClick={() => setCancelOpen(true)}>
                  Cancelar
                </Button>
                {next && (
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowRight size={16} />}
                    onClick={() => onAdvance(order)}
                  >
                    Avanzar a "{ORDER_STATUS_LABELS[next]}"
                  </Button>
                )}
              </Stack>
            </Can>
          ) : undefined
        }
      >
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <OrderTimer createdAt={order.createdAt} />
            {delayed && <StatusChip label="Pedido retrasado" tone="error" />}
          </Stack>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Cliente
            </Typography>
            <Typography variant="body2">{customerName(order)}</Typography>
            {order.tableNumber && (
              <Typography variant="caption" color="text.secondary">
                Mesa {order.tableNumber}
              </Typography>
            )}
            {order.deliveryAddress && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start', color: 'text.secondary', mt: 0.5 }}>
                <MapPin size={13} style={{ marginTop: 2 }} />
                <Typography variant="caption">{order.deliveryAddress}</Typography>
              </Stack>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Productos
            </Typography>
            <Stack spacing={1.5}>
              {order.items.map((item) => (
                <Stack key={item.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.quantity}× {item.productNameSnapshot}
                    </Typography>
                    {item.notes && (
                      <Typography variant="caption" color="text.secondary">
                        Nota: {item.notes}
                      </Typography>
                    )}
                  </Box>
                  <CurrencyDisplay value={item.totalPrice} variant="body2" />
                </Stack>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Stack spacing={0.75}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <CurrencyDisplay value={order.subtotal} variant="body2" />
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Descuento
              </Typography>
              <CurrencyDisplay value={-order.discountAmount} variant="body2" />
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Impuestos
              </Typography>
              <CurrencyDisplay value={order.taxAmount} variant="body2" />
            </Stack>
            {order.deliveryFee > 0 && (
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Domicilio
                </Typography>
                <CurrencyDisplay value={order.deliveryFee} variant="body2" />
              </Stack>
            )}
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Total
              </Typography>
              <CurrencyDisplay value={order.totalAmount} variant="subtitle1" sx={{ fontWeight: 700 }} />
            </Stack>
          </Stack>

          {order.notes && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Notas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.notes}
                </Typography>
              </Box>
            </>
          )}

          <Divider />

          <Box>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Pagos
              </Typography>
              <StatusChip
                label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
                tone={PAYMENT_STATUS_TONE[order.paymentStatus]}
              />
            </Stack>
            <Stack spacing={1}>
              {payments.map((payment) => (
                <Stack key={payment.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                    {payment.payerLabel && (
                      <Typography component="span" variant="caption" color="text.secondary">
                        {' '}
                        · {payment.payerLabel}
                      </Typography>
                    )}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CurrencyDisplay value={payment.amount} variant="body2" />
                    <DateDisplay value={payment.paidAt} mode="time" variant="caption" color="text.secondary" />
                  </Stack>
                </Stack>
              ))}
              {payments.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Sin pagos registrados.
                </Typography>
              )}
            </Stack>

            {canRegisterPayment && (
              <Can permission="orders.update">
                <Button
                  size="small"
                  startIcon={<Users size={15} />}
                  onClick={() => setSplitBillOpen(true)}
                  sx={{ mt: 1.5 }}
                >
                  Dividir cuenta
                </Button>
                <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                  <TextField
                    select
                    size="small"
                    label="Método"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    sx={{ minWidth: 140 }}
                  >
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    label="Monto"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={String(balanceDue)}
                    sx={{ width: 140 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<CreditCard size={15} />}
                    onClick={handleRegisterPayment}
                    disabled={createPayment.isPending}
                  >
                    Registrar
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Saldo pendiente: {balanceDue}
                </Typography>
              </Can>
            )}
          </Box>
        </Stack>
      </DetailDrawer>

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancelar pedido</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Esta acción marcará el pedido como cancelado. Indica el motivo para dejar trazabilidad.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Motivo de la cancelación"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCancelOpen(false)} color="inherit">
            Volver
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onCancel(order, cancelReason || 'Cancelado por el operador');
              setCancelOpen(false);
              setCancelReason('');
            }}
          >
            Cancelar pedido
          </Button>
        </DialogActions>
      </Dialog>

      <SplitBillDialog
        open={splitBillOpen}
        orderId={order.id}
        balanceDue={balanceDue}
        onClose={() => setSplitBillOpen(false)}
        onDone={() => setSplitBillOpen(false)}
      />
    </>
  );
}
