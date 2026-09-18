import { ReimbursementsController } from './reimbursements.controller';
import { ReimbursementsService } from '../services/reimbursements.service';

describe('ReimbursementsController', () => {
  let service: jest.Mocked<
    Pick<ReimbursementsService, 'findAll' | 'getSummary' | 'findOne' | 'payObligation' | 'voidObligation'>
  >;
  let controller: ReimbursementsController;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      getSummary: jest.fn(),
      findOne: jest.fn(),
      payObligation: jest.fn(),
      voidObligation: jest.fn(),
    };
    controller = new ReimbursementsController(service as unknown as ReimbursementsService);
  });

  it('findAll() scopes to the current business and forwards filters/pagination', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} as never });

    await controller.findAll('business-1', { page: 2, limit: 10, status: 'PENDING' as never, sortOrder: 'DESC' as never });

    expect(service.findAll).toHaveBeenCalledWith({
      businessId: 'business-1',
      page: 2,
      limit: 10,
      status: 'PENDING',
      payerEmployeeId: undefined,
    });
  });

  it('getSummary() scopes to the current business', async () => {
    service.getSummary.mockResolvedValue({ pendingCount: 2, pendingTotalAmount: 50000 });
    await controller.getSummary('business-1');
    expect(service.getSummary).toHaveBeenCalledWith('business-1');
  });

  it('findOne() scopes to the current business', async () => {
    service.findOne.mockResolvedValue({} as never);
    await controller.findOne('business-1', 'obligation-1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'obligation-1');
  });

  it('payObligation() forwards branch/amount/notes and the actor', async () => {
    await controller.payObligation('business-1', 'actor-1', 'obligation-1', {
      branchId: 'branch-1',
      amount: 40000,
      notes: 'abono',
    });

    expect(service.payObligation).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
      'obligation-1',
      40000,
      'actor-1',
      'abono',
    );
  });

  it('voidObligation() forwards the reason and the actor', async () => {
    await controller.voidObligation('business-1', 'actor-1', 'obligation-1', { reason: 'error de registro' });

    expect(service.voidObligation).toHaveBeenCalledWith('business-1', 'obligation-1', 'actor-1', 'error de registro');
  });
});
