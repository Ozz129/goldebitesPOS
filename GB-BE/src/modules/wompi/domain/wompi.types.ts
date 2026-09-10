export type WompiIntentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';

export interface WompiIntentRow {
  id: string;
  business_id: string;
  order_id: string;
  reference: string;
  amount_in_cents: string;
  payer_label: string | null;
  status: WompiIntentStatus;
  wompi_transaction_id: string | null;
  payment_id: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWompiIntentData {
  businessId: string;
  orderId: string;
  reference: string;
  amountInCents: number;
  payerLabel?: string;
}

export interface WompiCheckoutParams {
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency: 'COP';
  signature: string;
}

/** Shape of GET {baseUrl}/transactions/:id — only the fields we actually use. */
export interface WompiTransactionResponse {
  data: {
    id: string;
    reference: string;
    amount_in_cents: number;
    status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED' | 'PENDING';
    payment_method_type: string;
    payment_method?: {
      extra?: {
        qr_id?: string;
        qr_image?: string;
      };
    };
  };
}

export interface WompiQrCheckout {
  reference: string;
  wompiTransactionId: string;
  /** Base64-encoded SVG, ready to render as `data:image/svg+xml;base64,${qrImage}`. */
  qrImage: string;
}
