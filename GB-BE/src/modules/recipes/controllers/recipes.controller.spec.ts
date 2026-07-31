import { RecipesController } from './recipes.controller';
import { RecipesService } from '../services/recipes.service';

describe('RecipesController', () => {
  let service: jest.Mocked<
    Pick<
      RecipesService,
      'create' | 'findByProduct' | 'update' | 'setItems' | 'remove'
    >
  >;
  let controller: RecipesController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findByProduct: jest.fn(),
      update: jest.fn(),
      setItems: jest.fn(),
      remove: jest.fn(),
    };
    controller = new RecipesController(service as unknown as RecipesService);
  });

  it('create() forwards recipe fields and items separately', async () => {
    service.create.mockResolvedValue({ id: 'recipe-1' } as never);

    await controller.create('business-1', 'actor-1', 'product-1', {
      name: 'Custom',
      yieldQuantity: 2,
      instructions: 'Mix well',
      items: [{ inventoryItemId: 'inv-1', quantity: 1 }],
    });

    expect(service.create).toHaveBeenCalledWith(
      {
        businessId: 'business-1',
        productId: 'product-1',
        name: 'Custom',
        yieldQuantity: 2,
        instructions: 'Mix well',
      },
      [{ inventoryItemId: 'inv-1', quantity: 1 }],
      'actor-1',
    );
  });

  it('findByProduct() delegates', async () => {
    service.findByProduct.mockResolvedValue({ id: 'recipe-1' } as never);
    await controller.findByProduct('business-1', 'product-1');
    expect(service.findByProduct).toHaveBeenCalledWith(
      'business-1',
      'product-1',
    );
  });

  it('update() delegates with actor', async () => {
    service.update.mockResolvedValue({ id: 'recipe-1' } as never);
    await controller.update('business-1', 'actor-1', 'product-1', {
      name: 'New',
    });
    expect(service.update).toHaveBeenCalledWith(
      'business-1',
      'product-1',
      { name: 'New' },
      'actor-1',
    );
  });

  it('setItems() delegates', async () => {
    service.setItems.mockResolvedValue({ id: 'recipe-1' } as never);
    await controller.setItems('business-1', 'actor-1', 'product-1', {
      items: [{ inventoryItemId: 'inv-1', quantity: 1 }],
    });
    expect(service.setItems).toHaveBeenCalledWith(
      'business-1',
      'product-1',
      [{ inventoryItemId: 'inv-1', quantity: 1 }],
      'actor-1',
    );
  });

  it('remove() delegates', async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove('business-1', 'actor-1', 'product-1');
    expect(service.remove).toHaveBeenCalledWith(
      'business-1',
      'product-1',
      'actor-1',
    );
  });
});
