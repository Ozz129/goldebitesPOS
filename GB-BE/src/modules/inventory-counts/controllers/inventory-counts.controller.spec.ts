import { InventoryCountsController } from './inventory-counts.controller';
import { InventoryCountsService } from '../services/inventory-counts.service';

describe('InventoryCountsController', () => {
  let service: jest.Mocked<
    Pick<
      InventoryCountsService,
      'start' | 'findAll' | 'findOne' | 'recordCount' | 'complete' | 'cancel'
    >
  >;
  let controller: InventoryCountsController;

  beforeEach(() => {
    service = {
      start: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      recordCount: jest.fn(),
      complete: jest.fn(),
      cancel: jest.fn(),
    };
    controller = new InventoryCountsController(
      service as unknown as InventoryCountsService,
    );
  });

  it('start() scopes to the current business', async () => {
    service.start.mockResolvedValue({ id: 'count-1' } as never);
    await controller.start('business-1', 'actor-1', {
      branchId: 'branch-1',
      inventoryItemIds: ['item-1'],
    });
    expect(service.start).toHaveBeenCalledWith(
      {
        businessId: 'business-1',
        branchId: 'branch-1',
        inventoryItemIds: ['item-1'],
      },
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

  it('findOne() delegates', async () => {
    service.findOne.mockResolvedValue({ id: 'count-1' } as never);
    await controller.findOne('business-1', 'count-1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'count-1');
  });

  it('recordCount() delegates the item id and counted quantity', async () => {
    service.recordCount.mockResolvedValue({ id: 'count-1' } as never);
    await controller.recordCount('business-1', 'count-1', {
      inventoryItemId: 'item-1',
      countedQuantity: 75,
    });
    expect(service.recordCount).toHaveBeenCalledWith(
      'business-1',
      'count-1',
      'item-1',
      75,
    );
  });

  it('complete() delegates with actor', async () => {
    service.complete.mockResolvedValue({ id: 'count-1' } as never);
    await controller.complete('business-1', 'actor-1', 'count-1');
    expect(service.complete).toHaveBeenCalledWith(
      'business-1',
      'count-1',
      'actor-1',
    );
  });

  it('cancel() delegates with actor', async () => {
    service.cancel.mockResolvedValue({ id: 'count-1' } as never);
    await controller.cancel('business-1', 'actor-1', 'count-1');
    expect(service.cancel).toHaveBeenCalledWith(
      'business-1',
      'count-1',
      'actor-1',
    );
  });
});
