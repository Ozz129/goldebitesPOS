import type { useSnackbar } from 'notistack';
import { formatCOP } from '../../../utils/format';

/** Announces a confirmed payment the way Bold/terminal readers do: a banner plus a spoken amount. */
export function announcePayment(
  amount: number,
  enqueueSnackbar: ReturnType<typeof useSnackbar>['enqueueSnackbar'],
) {
  const amountLabel = formatCOP(amount);
  enqueueSnackbar(`¡Recibiste un pago de ${amountLabel}!`, {
    variant: 'success',
    persist: true,
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
  });
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(`Recibiste un pago de ${amountLabel}`);
    utterance.lang = 'es-CO';
    window.speechSynthesis.speak(utterance);
  }
}
