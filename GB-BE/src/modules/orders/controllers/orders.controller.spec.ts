import { OrdersController } from './orders.controller';
import { OrdersService } from '../services/orders.service';

describe('OrdersController', () => {
  let service: jest.Mocked<
    Pick<
      OrdersService,
      'create' | 'findAll' | 'findOne' | 'replaceItems' | 'updateStatus'
    >
  >;
  let controller: OrdersController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      replaceItems: jest.fn(),
      updateStatus: jest.fn(),
    };
    controller = new OrdersController(service as unknown as OrdersService);
  });

  it('create() separates items from the rest of the payload', async () => {
    service.create.mockResolvedValue({ id: 'order-1' } as never);
    await controller.create('business-1', 'actor-1', {
      branchId: 'branch-1',
      orderType: 'DINE_IN' as never,
      items: [{ productId: 'product-1', quantity: 2 }],
    });
    expect(service.create).toHaveBeenCalledWith(
      { businessId: 'business-1', branchId: 'branch-1', orderType: 'DINE_IN' },
      [{ productId: 'product-1', quantity: 2 }],
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
      status: 'PENDING' as never,
    });
    expect(service.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'business-1',
        branchId: 'branch-1',
        status: 'PENDING',
      }),
    );
  });

  it('findOne() delegates', async () => {
    service.findOne.mockResolvedValue({ id: 'order-1' } as never);
    await controller.findOne('business-1', 'order-1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'order-1');
  });

  it('replaceItems() delegates', async () => {
    service.replaceItems.mockResolvedValue({ id: 'order-1' } as never);
    await controller.replaceItems('business-1', 'actor-1', 'order-1', {
      items: [{ productId: 'product-1', quantity: 1 }],
    });
    expect(service.replaceItems).toHaveBeenCalledWith(
      'business-1',
      'order-1',
      [{ productId: 'product-1', quantity: 1 }],
      'actor-1',
    );
  });

  it('updateStatus() delegates', async () => {
    service.updateStatus.mockResolvedValue({ id: 'order-1' } as never);
    await controller.updateStatus('business-1', 'actor-1', 'order-1', {
      status: 'CONFIRMED' as never,
      notes: 'ok',
    });
    expect(service.updateStatus).toHaveBeenCalledWith(
      'business-1',
      'order-1',
      'CONFIRMED',
      'actor-1',
      'ok',
    );
  });
});
