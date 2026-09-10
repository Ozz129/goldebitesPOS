export interface WompiCheckoutParams {
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency: 'COP';
  signature: string;
}

export interface CreateWompiIntentPayload {
  payerLabel?: string;
}

export interface ConfirmWompiTransactionPayload {
  wompiTransactionId: string;
}

export interface WompiConfirmResult {
  intent: { status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED' };
  payment: { id: string; amount: number } | null;
}

export interface WompiQrCheckout {
  reference: string;
  wompiTransactionId: string;
  /** Base64-encoded SVG — render as `data:image/svg+xml;base64,${qrImage}`. */
  qrImage: string;
}
