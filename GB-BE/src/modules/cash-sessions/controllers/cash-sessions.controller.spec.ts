import { CashSessionsController } from './cash-sessions.controller';
import { CashSessionsService } from '../services/cash-sessions.service';

describe('CashSessionsController', () => {
  let service: jest.Mocked<
    Pick<
      CashSessionsService,
      | 'open'
      | 'findAll'
      | 'findCurrent'
      | 'findOne'
      | 'recordMovement'
      | 'close'
    >
  >;
  let controller: CashSessionsController;

  beforeEach(() => {
    service = {
      open: jest.fn(),
      findAll: jest.fn(),
      findCurrent: jest.fn(),
      findOne: jest.fn(),
      recordMovement: jest.fn(),
      close: jest.fn(),
    };
    controller = new CashSessionsController(
      service as unknown as CashSessionsService,
    );
  });

  it('open() scopes to the current business', async () => {
    service.open.mockResolvedValue({ id: 'session-1' } as never);
    await controller.open('business-1', 'actor-1', {
      branchId: 'branch-1',
      openingAmount: 50000,
    });
    expect(service.open).toHaveBeenCalledWith(
      { businessId: 'business-1', branchId: 'branch-1', openingAmount: 50000 },
      'actor-1',
    );
  });

  it('findAll() forwards filters', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);
    await controller.findAll('business-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      branchId: 'branch-1',
    });
    expect(service.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'business-1',
        branchId: 'branch-1',
      }),
    );
  });

  it('findCurrent() delegates', async () => {
    service.findCurrent.mockResolvedValue({ id: 'session-1' } as never);
    await controller.findCurrent('business-1', { branchId: 'branch-1' });
    expect(service.findCurrent).toHaveBeenCalledWith('business-1', 'branch-1');
  });

  it('findOne() delegates', async () => {
    service.findOne.mockResolvedValue({ id: 'session-1' } as never);
    await controller.findOne('business-1', 'session-1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'session-1');
  });

  it('addMovement() delegates', async () => {
    service.recordMovement.mockResolvedValue({ id: 'mov-1' } as never);
    await controller.addMovement('business-1', 'actor-1', 'session-1', {
      movementType: 'EXPENSE' as never,
      amount: 100,
      description: 'Ice',
    });
    expect(service.recordMovement).toHaveBeenCalledWith(
      'business-1',
      'session-1',
      'EXPENSE',
      100,
      'Ice',
      'actor-1',
    );
  });

  it('close() delegates', async () => {
    service.close.mockResolvedValue({ id: 'session-1' } as never);
    await controller.close('business-1', 'actor-1', 'session-1', {
      actualClosingAmount: 1000,
    });
    expect(service.close).toHaveBeenCalledWith(
      'business-1',
      'session-1',
      { actualClosingAmount: 1000 },
      'actor-1',
    );
  });
});
