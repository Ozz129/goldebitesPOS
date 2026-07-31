import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from '../services/purchase-orders.service';

describe('PurchaseOrdersController', () => {
  let service: jest.Mocked<
    Pick<
      PurchaseOrdersService,
      'create' | 'findAll' | 'findOne' | 'submit' | 'approve' | 'cancel'
    >
  >;
  let controller: PurchaseOrdersController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      submit: jest.fn(),
      approve: jest.fn(),
      cancel: jest.fn(),
    };
    controller = new PurchaseOrdersController(
      service as unknown as PurchaseOrdersService,
    );
  });

  it('create() separates items from the rest of the payload', async () => {
    service.create.mockResolvedValue({ id: 'po-1' } as never);
    await controller.create('business-1', 'actor-1', {
      branchId: 'branch-1',
      supplierId: 'supplier-1',
      items: [{ inventoryItemId: 'item-1', quantity: 50, unitCost: 2.5 }],
    });
    expect(service.create).toHaveBeenCalledWith(
      {
        businessId: 'business-1',
        branchId: 'branch-1',
        supplierId: 'supplier-1',
      },
      [{ inventoryItemId: 'item-1', quantity: 50, unitCost: 2.5 }],
      'actor-1',
    );
  });

  it('findAll() forwards filters', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);
    await controller.findAll('business-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      supplierId: 'supplier-1',
    });
    expect(service.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'business-1',
        supplierId: 'supplier-1',
      }),
    );
  });

  it('findOne() delegates', async () => {
    service.findOne.mockResolvedValue({ id: 'po-1' } as never);
    await controller.findOne('business-1', 'po-1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'po-1');
  });

  it('submit() delegates with actor', async () => {
    service.submit.mockResolvedValue({ id: 'po-1' } as never);
    await controller.submit('business-1', 'actor-1', 'po-1');
    expect(service.submit).toHaveBeenCalledWith(
      'business-1',
      'po-1',
      'actor-1',
    );
  });

  it('approve() delegates with actor', async () => {
    service.approve.mockResolvedValue({ id: 'po-1' } as never);
    await controller.approve('business-1', 'actor-1', 'po-1');
    expect(service.approve).toHaveBeenCalledWith(
      'business-1',
      'po-1',
      'actor-1',
    );
  });

  it('cancel() delegates with actor', async () => {
    service.cancel.mockResolvedValue({ id: 'po-1' } as never);
    await controller.cancel('business-1', 'actor-1', 'po-1');
    expect(service.cancel).toHaveBeenCalledWith(
      'business-1',
      'po-1',
      'actor-1',
    );
  });
});
