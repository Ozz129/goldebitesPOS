import { BankTransferController } from './bank-transfer.controller';
import { BankTransferRequestsService } from '../services/bank-transfer-requests.service';

describe('BankTransferController', () => {
  let service: jest.Mocked<
    Pick<BankTransferRequestsService, 'start' | 'getStatus' | 'recheck' | 'cancel' | 'confirmManual'>
  >;
  let controller: BankTransferController;

  beforeEach(() => {
    service = {
      start: jest.fn(),
      getStatus: jest.fn(),
      recheck: jest.fn(),
      cancel: jest.fn(),
      confirmManual: jest.fn(),
    };
    controller = new BankTransferController(service as unknown as BankTransferRequestsService);
  });

  it('start() delegates with the actor', async () => {
    service.start.mockResolvedValue({ state: 'NONE' });
    await controller.start('business-1', 'actor-1', 'order-1');
    expect(service.start).toHaveBeenCalledWith('business-1', 'order-1', 'actor-1');
  });

  it('getStatus() delegates', async () => {
    service.getStatus.mockResolvedValue({ state: 'NONE' });
    await controller.getStatus('business-1', 'order-1');
    expect(service.getStatus).toHaveBeenCalledWith('business-1', 'order-1');
  });

  it('recheck() delegates', async () => {
    service.recheck.mockResolvedValue({ state: 'NONE' });
    await controller.recheck('business-1', 'order-1');
    expect(service.recheck).toHaveBeenCalledWith('business-1', 'order-1');
  });

  it('cancel() delegates', async () => {
    service.cancel.mockResolvedValue({ state: 'NONE' });
    await controller.cancel('business-1', 'order-1');
    expect(service.cancel).toHaveBeenCalledWith('business-1', 'order-1');
  });

  it('confirmManual() delegates with the chosen transaction id and the actor', async () => {
    service.confirmManual.mockResolvedValue({ state: 'NONE' });
    await controller.confirmManual('business-1', 'actor-1', 'order-1', { transactionId: 'tx-1' });
    expect(service.confirmManual).toHaveBeenCalledWith('business-1', 'order-1', 'tx-1', 'actor-1');
  });
});
