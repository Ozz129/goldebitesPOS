import { NotFoundException } from '@nestjs/common';
import { BankVerificationEnabledGuard } from './bank-verification-enabled.guard';

describe('BankVerificationEnabledGuard', () => {
  function makeGuard(enabled: boolean): BankVerificationEnabledGuard {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue({ bankVerification: { enabled } }),
    };
    return new BankVerificationEnabledGuard(configService as never);
  }

  it('allows the request through when enabled', () => {
    const guard = makeGuard(true);
    expect(guard.canActivate({} as never)).toBe(true);
  });

  it('throws a 404 (not 403) when disabled, hiding that the feature exists', () => {
    const guard = makeGuard(false);
    expect(() => guard.canActivate({} as never)).toThrow(NotFoundException);
  });
});
