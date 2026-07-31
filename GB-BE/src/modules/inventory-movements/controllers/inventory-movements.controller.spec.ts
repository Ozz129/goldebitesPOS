import { InventoryMovementsController } from './inventory-movements.controller';
import { InventoryMovementsService } from '../services/inventory-movements.service';

describe('InventoryMovementsController', () => {
  let service: jest.Mocked<
    Pick<
      InventoryMovementsService,
      'getStock' | 'getLowStockAlerts' | 'getKardex' | 'createAdjustment'
    >
  >;
  let controller: InventoryMovementsController;

  beforeEach(() => {
    service = {
      getStock: jest.fn(),
      getLowStockAlerts: jest.fn(),
      getKardex: jest.fn(),
      createAdjustment: jest.fn(),
    };
    controller = new InventoryMovementsController(
      service as unknown as InventoryMovementsService,
    );
  });

  it('getStock() scopes the query to the current business', async () => {
    service.getStock.mockResolvedValue([]);
    await controller.getStock('business-1', {
      branchId: 'branch-1',
    });
    expect(service.getStock).toHaveBeenCalledWith({
      businessId: 'business-1',
      branchId: 'branch-1',
    });
  });

  it('getLowStock() forwards branchId', async () => {
    service.getLowStockAlerts.mockResolvedValue([]);
    await controller.getLowStock('business-1', { branchId: 'branch-1' });
    expect(service.getLowStockAlerts).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
    );
  });

  it('getMovements() forwards all filters', async () => {
    service.getKardex.mockResolvedValue({ data: [], meta: {} } as never);
    await controller.getMovements('business-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      branchId: 'branch-1',
      inventoryItemId: 'item-1',
    });
    expect(service.getKardex).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'business-1',
        branchId: 'branch-1',
        inventoryItemId: 'item-1',
      }),
    );
  });

  it('createAdjustment() scopes to business and forwards the actor', async () => {
    service.createAdjustment.mockResolvedValue({ id: 'mov-1' } as never);
    await controller.createAdjustment('business-1', 'actor-1', {
      branchId: 'branch-1',
      inventoryItemId: 'item-1',
      direction: 'IN',
      quantity: 10,
      reason: 'Initial stock',
    });
    expect(service.createAdjustment).toHaveBeenCalledWith(
      {
        businessId: 'business-1',
        branchId: 'branch-1',
        inventoryItemId: 'item-1',
        direction: 'IN',
        quantity: 10,
        reason: 'Initial stock',
      },
      'actor-1',
    );
  });
});
