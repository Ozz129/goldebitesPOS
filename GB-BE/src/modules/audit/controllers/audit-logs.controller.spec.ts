import { AuditLogsController } from './audit-logs.controller';
import { AuditService } from '../services/audit.service';

describe('AuditLogsController', () => {
  let service: jest.Mocked<Pick<AuditService, 'findAll'>>;
  let controller: AuditLogsController;

  beforeEach(() => {
    service = { findAll: jest.fn() };
    controller = new AuditLogsController(service as unknown as AuditService);
  });

  it('findAll() scopes to the current business and forwards filters', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);
    await controller.findAll('business-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      entityType: 'order',
      action: 'CREATE',
    });
    expect(service.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'business-1',
        entityType: 'order',
        action: 'CREATE',
      }),
    );
  });
});
