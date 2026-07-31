import { KitchenController } from './kitchen.controller';
import { KitchenService } from '../services/kitchen.service';

describe('KitchenController', () => {
  let service: jest.Mocked<Pick<KitchenService, 'getQueue' | 'updateStatus'>>;
  let controller: KitchenController;

  beforeEach(() => {
    service = { getQueue: jest.fn(), updateStatus: jest.fn() };
    controller = new KitchenController(service as unknown as KitchenService);
  });

  it('getQueue() forwards the branch filter', async () => {
    service.getQueue.mockResolvedValue([]);
    await controller.getQueue('business-1', { branchId: 'branch-1' });
    expect(service.getQueue).toHaveBeenCalledWith('business-1', 'branch-1');
  });

  it('updateStatus() delegates with actor', async () => {
    service.updateStatus.mockResolvedValue({ id: 'order-1' } as never);
    await controller.updateStatus('business-1', 'actor-1', 'order-1', {
      status: 'READY' as never,
    });
    expect(service.updateStatus).toHaveBeenCalledWith(
      'business-1',
      'order-1',
      'READY',
      'actor-1',
    );
  });
});
