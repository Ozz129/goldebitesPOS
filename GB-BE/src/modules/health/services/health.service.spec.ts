import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../database/database.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let databaseService: { healthCheck: jest.Mock };

  beforeEach(async () => {
    databaseService = { healthCheck: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: DatabaseService, useValue: databaseService },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  describe('getSummary', () => {
    it('reports ok when the database is connected', async () => {
      databaseService.healthCheck.mockResolvedValue({
        connected: true,
        latencyMs: 5,
      });

      const summary = await service.getSummary();

      expect(summary.status).toBe('ok');
      expect(summary.database).toBe('connected');
      expect(typeof summary.uptime).toBe('number');
      expect(summary.timestamp).toEqual(expect.any(String));
    });

    it('reports error when the database is unreachable', async () => {
      databaseService.healthCheck.mockResolvedValue({
        connected: false,
        latencyMs: 5000,
        error: 'timeout',
      });

      const summary = await service.getSummary();

      expect(summary.status).toBe('error');
      expect(summary.database).toBe('disconnected');
    });
  });

  describe('getReadiness', () => {
    it('is ready when the database check passes', async () => {
      databaseService.healthCheck.mockResolvedValue({
        connected: true,
        latencyMs: 5,
      });

      const readiness = await service.getReadiness();

      expect(readiness.status).toBe('ready');
      expect(readiness.checks.database).toBe(true);
    });

    it('is not_ready when the database check fails', async () => {
      databaseService.healthCheck.mockResolvedValue({
        connected: false,
        latencyMs: 5,
      });

      const readiness = await service.getReadiness();

      expect(readiness.status).toBe('not_ready');
      expect(readiness.checks.database).toBe(false);
    });
  });

  describe('getLiveness', () => {
    it('always reports alive', () => {
      expect(service.getLiveness()).toEqual({ status: 'alive' });
    });
  });
});
