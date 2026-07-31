import { GoodsReceiptsController } from './goods-receipts.controller';
import { GoodsReceiptsService } from '../services/goods-receipts.service';

describe('GoodsReceiptsController', () => {
  let service: jest.Mocked<
    Pick<GoodsReceiptsService, 'receive' | 'findAll' | 'findOne'>
  >;
  let controller: GoodsReceiptsController;

  beforeEach(() => {
    service = {
      receive: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    controller = new GoodsReceiptsController(
      service as unknown as GoodsReceiptsService,
    );
  });

  it('receive() forwards purchaseOrderId, items, notes and actor', async () => {
    service.receive.mockResolvedValue({ id: 'receipt-1' } as never);
    await controller.receive('business-1', 'actor-1', {
      purchaseOrderId: 'po-1',
      notes: 'Partial delivery',
      items: [
        { purchaseOrderItemId: 'poi-1', quantityReceived: 20, unitCost: 2.75 },
      ],
    });
    expect(service.receive).toHaveBeenCalledWith(
      'business-1',
      'po-1',
      [{ purchaseOrderItemId: 'poi-1', quantityReceived: 20, unitCost: 2.75 }],
      'Partial delivery',
      'actor-1',
    );
  });

  it('findAll() forwards filters', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);
    await controller.findAll('business-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      purchaseOrderId: 'po-1',
    });
    expect(service.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'business-1',
        purchaseOrderId: 'po-1',
      }),
    );
  });

  it('findOne() delegates', async () => {
    service.findOne.mockResolvedValue({ id: 'receipt-1' } as never);
    await controller.findOne('business-1', 'receipt-1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'receipt-1');
  });
});
