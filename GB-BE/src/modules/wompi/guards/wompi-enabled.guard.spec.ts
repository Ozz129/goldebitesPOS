import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { WompiEnabledGuard } from './wompi-enabled.guard';
import { WompiService } from '../services/wompi.service';

describe('WompiEnabledGuard', () => {
  it('allows the request through when Wompi is enabled', () => {
    const wompiService = { isEnabled: jest.fn().mockReturnValue(true) };
    const guard = new WompiEnabledGuard(wompiService as unknown as WompiService);

    expect(guard.canActivate({} as ExecutionContext)).toBe(true);
  });

  it('throws a 404 (not a 403) when Wompi is disabled, keeping the feature invisible', () => {
    const wompiService = { isEnabled: jest.fn().mockReturnValue(false) };
    const guard = new WompiEnabledGuard(wompiService as unknown as WompiService);

    expect(() => guard.canActivate({} as ExecutionContext)).toThrow(NotFoundException);
  });
});
