import { useState } from 'react';
import Button from '@mui/material/Button';
import { Landmark } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useCreateWompiIntent } from '../../../modules/wompi/hooks/use-create-wompi-intent';
import { useConfirmWompiTransaction } from '../../../modules/wompi/hooks/use-confirm-wompi-transaction';
import { openWompiCheckout } from '../../../modules/wompi/utils/load-wompi-widget';
import { normalizeApiError } from '../../../lib/api/api-error';
import { announcePayment } from '../utils/announce-payment';

interface WompiCheckoutButtonProps {
  orderId: string;
  payerLabel?: string;
  onPaid: (amount: number) => void;
}

/** Sandbox-only alternative to registering a payment manually — hidden unless VITE_WOMPI_PAYMENTS_ENABLED='true'. */
export default function WompiCheckoutButton({ orderId, payerLabel, onPaid }: WompiCheckoutButtonProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [processing, setProcessing] = useState(false);
  const createIntent = useCreateWompiIntent(orderId);
  const confirmTransaction = useConfirmWompiTransaction(orderId);

  async function handleClick() {
    setProcessing(true);
    try {
      const intent = await createIntent.mutateAsync({ payerLabel });
      const result = await openWompiCheckout({
        currency: intent.currency,
        amountInCents: intent.amountInCents,
        reference: intent.reference,
        publicKey: intent.publicKey,
        signature: { integrity: intent.signature },
      });

      if (!result.transaction) {
        enqueueSnackbar('El pago con Wompi se cerró sin completarse.', { variant: 'info' });
        return;
      }

      const confirmed = await confirmTransaction.mutateAsync({
        reference: intent.reference,
        payload: { wompiTransactionId: result.transaction.id },
      });

      if (confirmed.payment) {
        announcePayment(confirmed.payment.amount, enqueueSnackbar);
        onPaid(confirmed.payment.amount);
      } else {
        enqueueSnackbar('Wompi no aprobó el pago. Intenta con otro medio.', { variant: 'warning' });
      }
    } catch (error) {
      enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Button
      variant="outlined"
      startIcon={<Landmark size={15} />}
      loading={processing}
      onClick={handleClick}
    >
      Cobrar con Wompi
    </Button>
  );
}
