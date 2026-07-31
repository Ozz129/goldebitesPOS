import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from '../services/suppliers.service';

describe('SuppliersController', () => {
  let service: jest.Mocked<
    Pick<
      SuppliersService,
      'create' | 'findAll' | 'findOne' | 'update' | 'setActive'
    >
  >;
  let controller: SuppliersController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
    };
    controller = new SuppliersController(
      service as unknown as SuppliersService,
    );
  });

  it('create() scopes to the current business', async () => {
    service.create.mockResolvedValue({ id: 'sup-1' } as never);
    await controller.create('business-1', 'actor-1', { name: 'Acme' });
    expect(service.create).toHaveBeenCalledWith(
      { businessId: 'business-1', name: 'Acme' },
      'actor-1',
    );
  });

  it('findAll() forwards filters', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);
    await controller.findAll('business-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      isActive: true,
      search: 'acme',
    });
    expect(service.findAll).toHaveBeenCalledWith({
      businessId: 'business-1',
      page: 1,
      limit: 20,
      isActive: true,
      search: 'acme',
    });
  });

  it('findOne() delegates', async () => {
    service.findOne.mockResolvedValue({ id: 'sup-1' } as never);
    await controller.findOne('business-1', 'sup-1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'sup-1');
  });

  it('update() delegates with actor', async () => {
    service.update.mockResolvedValue({ id: 'sup-1' } as never);
    await controller.update('business-1', 'actor-1', 'sup-1', { name: 'New' });
    expect(service.update).toHaveBeenCalledWith(
      'business-1',
      'sup-1',
      { name: 'New' },
      'actor-1',
    );
  });

  it('setStatus() delegates', async () => {
    service.setActive.mockResolvedValue({ id: 'sup-1' } as never);
    await controller.setStatus('business-1', 'actor-1', 'sup-1', {
      isActive: false,
    });
    expect(service.setActive).toHaveBeenCalledWith(
      'business-1',
      'sup-1',
      false,
      'actor-1',
    );
  });
});
