import { NfcOrderSubmissionRow } from '../domain/nfc-order-submission.interface';

export const NFC_ORDER_SUBMISSIONS_REPOSITORY = Symbol(
  'NFC_ORDER_SUBMISSIONS_REPOSITORY',
);

export interface INfcOrderSubmissionsRepository {
  /** Atomically claims the key. Returns true if this call won the claim, false if the key already existed. */
  claim(idempotencyKey: string): Promise<boolean>;
  findByKey(idempotencyKey: string): Promise<NfcOrderSubmissionRow | null>;
  linkOrder(idempotencyKey: string, orderId: string): Promise<void>;
  /** Only deletes an unresolved (order_id IS NULL) claim — never removes a completed submission's record. */
  deleteUnresolvedClaim(idempotencyKey: string): Promise<void>;
}
