export interface RawEmailMessage {
  /** Provider-native message id — becomes NormalizedBankTransaction.externalId, must be stable and unique. */
  id: string;
  /** The actual address from the From header (e.g. "alertas@bancolombia.com.co"), never the display name alone. */
  fromAddress: string;
  fromHeader: string;
  subject: string;
  receivedAt: Date;
  bodyText: string;
  /** Raw `Authentication-Results` header when present — best-effort SPF/DKIM signal, not a hard guarantee. */
  authenticationResults?: string;
}

/** Port over a mailbox. GmailApiEmailProvider is the only implementation today. */
export interface EmailProvider {
  listMessagesSince(since: Date): Promise<RawEmailMessage[]>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
