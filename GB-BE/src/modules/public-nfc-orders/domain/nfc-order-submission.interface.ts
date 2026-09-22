export interface NfcOrderSubmissionRow {
  idempotency_key: string;
  order_id: string | null;
  created_at: Date;
}
