import { InventoryTransfersController } from './inventory-transfers.controller';
import { InventoryTransfersService } from '../services/inventory-transfers.service';

describe('InventoryTransfersController', () => {
  let service: jest.Mocked<
    Pick<
      InventoryTransfersService,
      'create' | 'findAll' | 'findOne' | 'complete' | 'cancel'
    >
  >;
  let controller: InventoryTransfersController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      complete: jest.fn(),
      cancel: jest.fn(),
    };
    controller = new InventoryTransfersController(
      service as unknown as InventoryTransfersService,
    );
  });

  it('create() separates items from the rest of the payload', async () => {
    service.create.mockResolvedValue({ id: 'transfer-1' } as never);
    await controller.create('business-1', 'actor-1', {
      fromBranchId: 'branch-1',
      toBranchId: 'branch-2',
      items: [{ inventoryItemId: 'item-1', quantity: 5 }],
    });
    expect(service.create).toHaveBeenCalledWith(
      {
        businessId: 'business-1',
        fromBranchId: 'branch-1',
        toBranchId: 'branch-2',
      },
      [{ inventoryItemId: 'item-1', quantity: 5 }],
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
    service.findOne.mockResolvedValue({ id: 'transfer-1' } as never);
    await controller.findOne('business-1', 'transfer-1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'transfer-1');
  });

  it('complete() delegates with actor', async () => {
    service.complete.mockResolvedValue({ id: 'transfer-1' } as never);
    await controller.complete('business-1', 'actor-1', 'transfer-1');
    expect(service.complete).toHaveBeenCalledWith(
      'business-1',
      'transfer-1',
      'actor-1',
    );
  });

  it('cancel() delegates with actor', async () => {
    service.cancel.mockResolvedValue({ id: 'transfer-1' } as never);
    await controller.cancel('business-1', 'actor-1', 'transfer-1');
    expect(service.cancel).toHaveBeenCalledWith(
      'business-1',
      'transfer-1',
      'actor-1',
    );
  });
});
