import { OrderStatus } from '../../orders/domain/order.interface';
import { KitchenService } from './kitchen.service';

describe('KitchenService', () => {
  let ordersService: { getKitchenQueue: jest.Mock; updateStatus: jest.Mock };
  let service: KitchenService;

  beforeEach(() => {
    ordersService = {
      getKitchenQueue: jest.fn().mockResolvedValue([]),
      updateStatus: jest.fn().mockResolvedValue({ id: 'order-1' }),
    };
    service = new KitchenService(ordersService as never);
  });

  it('getQueue() delegates to OrdersService.getKitchenQueue', async () => {
    await service.getQueue('business-1', 'branch-1');

    expect(ordersService.getKitchenQueue).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
    );
  });

  it('updateStatus() delegates to OrdersService.updateStatus', async () => {
    await service.updateStatus(
      'business-1',
      'order-1',
      OrderStatus.PREPARING,
      'actor-1',
    );

    expect(ordersService.updateStatus).toHaveBeenCalledWith(
      'business-1',
      'order-1',
      OrderStatus.PREPARING,
      'actor-1',
    );
  });
});
