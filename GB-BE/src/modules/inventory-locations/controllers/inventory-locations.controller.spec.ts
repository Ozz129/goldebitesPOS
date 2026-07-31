import { InventoryLocationsController } from './inventory-locations.controller';
import { InventoryLocationsService } from '../services/inventory-locations.service';

describe('InventoryLocationsController', () => {
  let service: jest.Mocked<
    Pick<
      InventoryLocationsService,
      'create' | 'findAll' | 'findOne' | 'update' | 'setActive'
    >
  >;
  let controller: InventoryLocationsController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
    };
    controller = new InventoryLocationsController(
      service as unknown as InventoryLocationsService,
    );
  });

  it('create() merges the route branchId into the payload', async () => {
    service.create.mockResolvedValue({ id: 'loc-1' } as never);
    await controller.create('business-1', 'actor-1', 'branch-1', {
      name: 'Main Storage',
    });
    expect(service.create).toHaveBeenCalledWith(
      'business-1',
      { branchId: 'branch-1', name: 'Main Storage' },
      'actor-1',
    );
  });

  it('findAll() forwards the branch and filters', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);
    await controller.findAll('business-1', 'branch-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      isActive: true,
    });
    expect(service.findAll).toHaveBeenCalledWith('business-1', {
      branchId: 'branch-1',
      page: 1,
      limit: 20,
      isActive: true,
    });
  });

  it('findOne() delegates', async () => {
    service.findOne.mockResolvedValue({ id: 'loc-1' } as never);
    await controller.findOne('business-1', 'branch-1', 'loc-1');
    expect(service.findOne).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
      'loc-1',
    );
  });

  it('update() delegates with actor', async () => {
    service.update.mockResolvedValue({ id: 'loc-1' } as never);
    await controller.update('business-1', 'actor-1', 'branch-1', 'loc-1', {
      name: 'New name',
    });
    expect(service.update).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
      'loc-1',
      { name: 'New name' },
      'actor-1',
    );
  });

  it('setStatus() delegates', async () => {
    service.setActive.mockResolvedValue({ id: 'loc-1' } as never);
    await controller.setStatus('business-1', 'actor-1', 'branch-1', 'loc-1', {
      isActive: false,
    });
    expect(service.setActive).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
      'loc-1',
      false,
      'actor-1',
    );
  });
});
