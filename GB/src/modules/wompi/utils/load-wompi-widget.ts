const WIDGET_SCRIPT_URL = 'https://checkout.wompi.co/widget.js';

export interface WompiTransactionResult {
  transaction?: {
    id: string;
    status: string;
    reference: string;
    amountInCents: number;
  };
}

interface WompiWidgetCheckoutOptions {
  currency: 'COP';
  amountInCents: number;
  reference: string;
  publicKey: string;
  signature: { integrity: string };
  redirectUrl?: string;
}

interface WompiWidgetCheckout {
  open(callback: (result: WompiTransactionResult) => void): void;
}

declare global {
  interface Window {
    WidgetCheckout?: new (options: WompiWidgetCheckoutOptions) => WompiWidgetCheckout;
  }
}

let widgetPromise: Promise<void> | null = null;

/** Lazily loads Wompi's widget.js exactly once — only ever called from behind the feature flag. */
function loadWompiWidgetScript(): Promise<void> {
  if (window.WidgetCheckout) return Promise.resolve();
  if (widgetPromise) return widgetPromise;

  widgetPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WIDGET_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      widgetPromise = null;
      reject(new Error('No se pudo cargar el widget de Wompi.'));
    };
    document.head.appendChild(script);
  });

  return widgetPromise;
}

/** Opens Wompi's checkout overlay for the given params; resolves with the transaction result. */
export async function openWompiCheckout(
  options: WompiWidgetCheckoutOptions,
): Promise<WompiTransactionResult> {
  await loadWompiWidgetScript();
  if (!window.WidgetCheckout) {
    throw new Error('El widget de Wompi no está disponible.');
  }
  const checkout = new window.WidgetCheckout(options);
  return new Promise((resolve) => {
    checkout.open((result) => resolve(result));
  });
}
