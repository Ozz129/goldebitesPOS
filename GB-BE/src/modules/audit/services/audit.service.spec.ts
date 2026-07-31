import { AuditLogRow } from '../domain/audit-log.interface';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let repository: { insert: jest.Mock; findAll: jest.Mock };
  let service: AuditService;

  function makeRow(overrides: Partial<AuditLogRow> = {}): AuditLogRow {
    return {
      id: 'log-1',
      business_id: 'business-1',
      branch_id: null,
      user_id: null,
      entity_type: 'order',
      entity_id: 'order-1',
      action: 'CREATE',
      old_values: null,
      new_values: null,
      metadata: null,
      ip_address: null,
      user_agent: null,
      created_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      insert: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
    };
    service = new AuditService(repository);
  });

  describe('record', () => {
    it('propagates errors when called inside a transaction (client passed)', async () => {
      const client = {} as never;
      repository.insert.mockRejectedValue(new Error('db down'));

      await expect(
        service.record({ entityType: 'order', action: 'CREATE' }, client),
      ).rejects.toThrow('db down');
    });

    it('swallows errors when called standalone (no client)', async () => {
      repository.insert.mockRejectedValue(new Error('db down'));

      await expect(
        service.record({ entityType: 'order', action: 'CREATE' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('maps rows to domain and builds pagination meta', async () => {
      repository.findAll.mockResolvedValue({ rows: [makeRow()], total: 1 });

      const result = await service.findAll({
        businessId: 'business-1',
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].entityType).toBe('order');
      expect(result.meta.total).toBe(1);
    });
  });
});
