import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategoriesService } from '../services/product-categories.service';

describe('ProductCategoriesController', () => {
  let service: jest.Mocked<
    Pick<
      ProductCategoriesService,
      'create' | 'findAll' | 'findOne' | 'update' | 'setActive'
    >
  >;
  let controller: ProductCategoriesController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
    };
    controller = new ProductCategoriesController(
      service as unknown as ProductCategoriesService,
    );
  });

  it('create() scopes to the current business', async () => {
    service.create.mockResolvedValue({ id: 'cat-1' } as never);

    await controller.create('business-1', 'actor-1', { name: 'Burgers' });

    expect(service.create).toHaveBeenCalledWith(
      { businessId: 'business-1', name: 'Burgers' },
      'actor-1',
    );
  });

  it('findAll() forwards pagination and filters', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);

    await controller.findAll('business-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      isActive: true,
      search: 'burg',
    });

    expect(service.findAll).toHaveBeenCalledWith({
      businessId: 'business-1',
      page: 1,
      limit: 20,
      isActive: true,
      search: 'burg',
    });
  });

  it('findOne() delegates', async () => {
    service.findOne.mockResolvedValue({ id: 'cat-1' } as never);
    await controller.findOne('business-1', 'cat-1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'cat-1');
  });

  it('update() delegates with actor', async () => {
    service.update.mockResolvedValue({ id: 'cat-1' } as never);
    await controller.update('business-1', 'actor-1', 'cat-1', { name: 'New' });
    expect(service.update).toHaveBeenCalledWith(
      'business-1',
      'cat-1',
      { name: 'New' },
      'actor-1',
    );
  });

  it('setStatus() delegates', async () => {
    service.setActive.mockResolvedValue({ id: 'cat-1' } as never);
    await controller.setStatus('business-1', 'actor-1', 'cat-1', {
      isActive: false,
    });
    expect(service.setActive).toHaveBeenCalledWith(
      'business-1',
      'cat-1',
      false,
      'actor-1',
    );
  });
});
