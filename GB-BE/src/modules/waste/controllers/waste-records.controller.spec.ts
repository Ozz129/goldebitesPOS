import { WasteRecordsController } from './waste-records.controller';
import { WasteRecordsService } from '../services/waste-records.service';

describe('WasteRecordsController', () => {
  let service: jest.Mocked<Pick<WasteRecordsService, 'create' | 'findAll'>>;
  let controller: WasteRecordsController;

  beforeEach(() => {
    service = { create: jest.fn(), findAll: jest.fn() };
    controller = new WasteRecordsController(
      service as unknown as WasteRecordsService,
    );
  });

  it('create() scopes to the current business', async () => {
    service.create.mockResolvedValue({ id: 'waste-1' } as never);
    await controller.create('business-1', 'actor-1', {
      branchId: 'branch-1',
      inventoryItemId: 'item-1',
      quantity: 2,
      reason: 'Melted',
    });
    expect(service.create).toHaveBeenCalledWith(
      {
        businessId: 'business-1',
        branchId: 'branch-1',
        inventoryItemId: 'item-1',
        quantity: 2,
        reason: 'Melted',
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
      inventoryItemId: 'item-1',
    });
    expect(service.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'business-1',
        branchId: 'branch-1',
        inventoryItemId: 'item-1',
      }),
    );
  });
});
