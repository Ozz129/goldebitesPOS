import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from '../services/health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: jest.Mocked<
    Pick<HealthService, 'getSummary' | 'getReadiness' | 'getLiveness'>
  >;

  beforeEach(() => {
    service = {
      getSummary: jest.fn(),
      getReadiness: jest.fn(),
      getLiveness: jest.fn(),
    };
    controller = new HealthController(service as unknown as HealthService);
  });

  it('check() returns the health summary', async () => {
    service.getSummary.mockResolvedValue({
      status: 'ok',
      database: 'connected',
      uptime: 10,
      timestamp: '2026-01-01T00:00:00.000Z',
    });

    await expect(controller.check()).resolves.toEqual(
      expect.objectContaining({ status: 'ok', database: 'connected' }),
    );
  });

  it('ready() returns readiness when the database check passes', async () => {
    service.getReadiness.mockResolvedValue({
      status: 'ready',
      checks: { database: true },
    });

    await expect(controller.ready()).resolves.toEqual({
      status: 'ready',
      checks: { database: true },
    });
  });

  it('ready() throws ServiceUnavailableException when the database check fails', async () => {
    service.getReadiness.mockResolvedValue({
      status: 'not_ready',
      checks: { database: false },
    });

    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('live() returns liveness synchronously', () => {
    service.getLiveness.mockReturnValue({ status: 'alive' });

    expect(controller.live()).toEqual({ status: 'alive' });
  });
});
