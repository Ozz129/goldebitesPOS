import { RawEmailMessage } from '../email-provider.interface';

/**
 * ============================================================================
 * FICTIONAL EXAMPLE — this is NOT the real Bancolombia notification format.
 * It exists only to exercise the parser's plumbing (sender/subject filtering,
 * extraction, error handling) in tests. Replace it — and recalibrate
 * BancolombiaNotificationParser's extraction rules — as soon as a real,
 * anonymized Bancolombia email is available. Do not use this to validate the
 * parser against production traffic.
 * ============================================================================
 */
export const FICTIONAL_BANCOLOMBIA_NOTIFICATION: RawEmailMessage = {
  id: 'fixture-message-001',
  fromAddress: 'alertasynotificaciones@bancolombia.com.co',
  fromHeader: 'Bancolombia <alertasynotificaciones@bancolombia.com.co>',
  subject: 'Comprobante de transferencia',
  receivedAt: new Date('2026-09-10T16:32:00Z'),
  bodyText:
    'Bancolombia te informa que recibiste una transferencia por $38.500 ' +
    'el 10/09/2026 a las 11:32 a.m. Comprobante No. 123456789. ' +
    'Este es un mensaje automático, por favor no responder.',
};

export const FICTIONAL_NOTIFICATION_WRONG_SENDER: RawEmailMessage = {
  ...FICTIONAL_BANCOLOMBIA_NOTIFICATION,
  id: 'fixture-message-002',
  fromAddress: 'attacker@example.com',
  fromHeader: 'Bancolombia <attacker@example.com>',
};

export const FICTIONAL_NOTIFICATION_UNRELATED_SUBJECT: RawEmailMessage = {
  ...FICTIONAL_BANCOLOMBIA_NOTIFICATION,
  id: 'fixture-message-003',
  subject: 'Tu extracto mensual ya está disponible',
};
