import { BancolombiaNotificationParser } from './bancolombia-notification.parser';
import {
  FICTIONAL_BANCOLOMBIA_NOTIFICATION,
  FICTIONAL_NOTIFICATION_UNRELATED_SUBJECT,
  FICTIONAL_NOTIFICATION_WRONG_SENDER,
} from './fixtures/sample-notification.fixture';

describe('BancolombiaNotificationParser', () => {
  let configService: { getOrThrow: jest.Mock };
  let parser: BancolombiaNotificationParser;

  function withConfig(overrides: { senderAllowlist?: string[]; subjectFilter?: string | null } = {}) {
    configService = {
      getOrThrow: jest.fn().mockReturnValue({
        bankVerification: {
          senderAllowlist: overrides.senderAllowlist ?? ['alertasynotificaciones@bancolombia.com.co'],
          subjectFilter: overrides.subjectFilter ?? null,
        },
      }),
    };
    parser = new BancolombiaNotificationParser(configService as never);
  }

  beforeEach(() => withConfig());

  it('rejects emails from a sender not on the allowlist, even with a legitimate-looking display name', () => {
    expect(parser.parse(FICTIONAL_NOTIFICATION_WRONG_SENDER)).toBeNull();
  });

  it('rejects emails whose subject does not match the configured filter', () => {
    withConfig({ subjectFilter: 'comprobante de transferencia' });
    expect(parser.parse(FICTIONAL_NOTIFICATION_UNRELATED_SUBJECT)).toBeNull();
  });

  it('parses amount and reference from an allowed, matching-subject email', () => {
    const result = parser.parse(FICTIONAL_BANCOLOMBIA_NOTIFICATION);
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(38500);
    expect(result?.reference).toBe('123456789');
    expect(result?.receivedAt).toEqual(FICTIONAL_BANCOLOMBIA_NOTIFICATION.receivedAt);
  });

  it('allows any sender when the allowlist is empty', () => {
    withConfig({ senderAllowlist: [] });
    expect(parser.parse(FICTIONAL_NOTIFICATION_WRONG_SENDER)).not.toBeNull();
  });

  it('returns null when no amount can be extracted from an otherwise legitimate email', () => {
    const result = parser.parse({ ...FICTIONAL_BANCOLOMBIA_NOTIFICATION, bodyText: 'Tu cuenta fue actualizada.' });
    expect(result).toBeNull();
  });
});
