import { FundType } from '../domain/fund.types';
import { FundsController } from './funds.controller';
import { FundsService } from '../services/funds.service';

describe('FundsController', () => {
  let service: jest.Mocked<Pick<FundsService, 'initializeReserve' | 'initializeBankAccount' | 'getBalance'>>;
  let controller: FundsController;

  beforeEach(() => {
    service = {
      initializeReserve: jest.fn(),
      initializeBankAccount: jest.fn(),
      getBalance: jest.fn(),
    };
    controller = new FundsController(service as unknown as FundsService);
  });

  it('initializeReserve() scopes to the current business and forwards the actor', async () => {
    service.initializeReserve.mockResolvedValue({} as never);
    await controller.initializeReserve('business-1', 'actor-1', {
      branchId: 'branch-1',
      amount: 100000,
      notes: 'conteo inicial',
    });
    expect(service.initializeReserve).toHaveBeenCalledWith({
      businessId: 'business-1',
      branchId: 'branch-1',
      amount: 100000,
      notes: 'conteo inicial',
      actorUserId: 'actor-1',
    });
  });

  it('initializeBankAccount() scopes to the current business and forwards the actor', async () => {
    service.initializeBankAccount.mockResolvedValue({} as never);
    await controller.initializeBankAccount('business-1', 'actor-1', { amount: 2000000, notes: 'saldo inicial' });
    expect(service.initializeBankAccount).toHaveBeenCalledWith({
      businessId: 'business-1',
      amount: 2000000,
      notes: 'saldo inicial',
      actorUserId: 'actor-1',
    });
  });

  it('getBalance() scopes to the current business and forwards the query', async () => {
    service.getBalance.mockResolvedValue({} as never);
    await controller.getBalance('business-1', { fundType: FundType.CASH_RESERVE, branchId: 'branch-1' });
    expect(service.getBalance).toHaveBeenCalledWith('business-1', FundType.CASH_RESERVE, 'branch-1');
  });
});
