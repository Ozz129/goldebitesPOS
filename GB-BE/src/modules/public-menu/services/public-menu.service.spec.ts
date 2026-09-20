import { EntityNotFoundException } from '../../../common/exceptions';
import { PublicMenuService } from './public-menu.service';

describe('PublicMenuService', () => {
  let businessesService: { findById: jest.Mock };
  let productCategoriesService: { findAll: jest.Mock };
  let productsService: { findAll: jest.Mock };
  let saucesService: { findAll: jest.Mock };
  let sidesService: { findAll: jest.Mock };
  let service: PublicMenuService;

  const businessId = 'business-1';

  beforeEach(() => {
    businessesService = { findById: jest.fn().mockResolvedValue({ id: businessId, name: 'Golden Bites' }) };
    productCategoriesService = {
      findAll: jest.fn().mockResolvedValue({
        data: [
          { id: 'cat-drinks', name: 'Bebidas' },
          { id: 'cat-empty', name: 'Sin productos activos' },
        ],
      }),
    };
    productsService = {
      findAll: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'p1',
            name: 'Limonada',
            salePrice: 8000,
            description: 'Con hierbabuena',
            categoryId: 'cat-drinks',
            imageUrl: null,
            maxSauces: 0,
            maxSides: 0,
          },
          {
            id: 'p2',
            name: 'Agua',
            salePrice: 3000,
            description: null,
            categoryId: 'cat-drinks',
            imageUrl: null,
            maxSauces: 0,
            maxSides: 0,
          },
          {
            id: 'p3',
            name: 'Combo especial',
            salePrice: 25000,
            description: 'Solo por hoy',
            categoryId: null,
            imageUrl: 'https://cdn.example.com/combo.jpg',
            maxSauces: 2,
            maxSides: 1,
          },
        ],
      }),
    };
    saucesService = {
      findAll: jest.fn().mockResolvedValue({ data: [{ id: 's1', name: 'BBQ' }, { id: 's2', name: 'Picante' }] }),
    };
    sidesService = {
      findAll: jest.fn().mockResolvedValue({ data: [{ id: 'sd1', name: 'Papas' }] }),
    };
    service = new PublicMenuService(
      businessesService as never,
      productCategoriesService as never,
      productsService as never,
      saucesService as never,
      sidesService as never,
    );
  });

  it('propagates EntityNotFoundException for an unknown business', async () => {
    businessesService.findById.mockRejectedValue(new EntityNotFoundException('Business', 'bogus'));
    await expect(service.getMenu('bogus')).rejects.toThrow(EntityNotFoundException);
  });

  it('only fetches products that are both active and visible — hidden surcharges never reach the public menu', async () => {
    await service.getMenu(businessId);
    expect(productsService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true, isVisible: true }),
    );
  });

  it('only fetches active sauces and sides', async () => {
    await service.getMenu(businessId);
    expect(saucesService.findAll).toHaveBeenCalledWith(expect.objectContaining({ businessId, isActive: true }));
    expect(sidesService.findAll).toHaveBeenCalledWith(expect.objectContaining({ businessId, isActive: true }));
  });

  it('groups active products by category, sorted by name within each category', async () => {
    const menu = await service.getMenu(businessId);

    expect(menu.businessName).toBe('Golden Bites');
    const drinks = menu.categories.find((c) => c.id === 'cat-drinks');
    expect(drinks?.products.map((p) => p.name)).toEqual(['Agua', 'Limonada']);
  });

  it('includes image, maxSauces, and maxSides on each product', async () => {
    const menu = await service.getMenu(businessId);
    const combo = menu.categories.flatMap((c) => c.products).find((p) => p.id === 'p3');

    expect(combo).toEqual(
      expect.objectContaining({ imageUrl: 'https://cdn.example.com/combo.jpg', maxSauces: 2, maxSides: 1 }),
    );
  });

  it('returns the business-wide active sauces/sides once, not duplicated per product', async () => {
    const menu = await service.getMenu(businessId);

    expect(menu.sauces).toEqual([{ id: 's1', name: 'BBQ' }, { id: 's2', name: 'Picante' }]);
    expect(menu.sides).toEqual([{ id: 'sd1', name: 'Papas' }]);
  });

  it('omits categories with no active products', async () => {
    const menu = await service.getMenu(businessId);
    expect(menu.categories.find((c) => c.id === 'cat-empty')).toBeUndefined();
  });

  it('groups uncategorized products under a synthetic "Otros" bucket', async () => {
    const menu = await service.getMenu(businessId);
    const otros = menu.categories.find((c) => c.id === null);
    expect(otros?.name).toBe('Otros');
    expect(otros?.products.map((p) => p.name)).toEqual(['Combo especial']);
  });

  it('omits the "Otros" bucket entirely when every active product has a category', async () => {
    productsService.findAll.mockResolvedValue({
      data: [{ id: 'p1', name: 'Limonada', salePrice: 8000, description: null, categoryId: 'cat-drinks', imageUrl: null, maxSauces: 0, maxSides: 0 }],
    });

    const menu = await service.getMenu(businessId);
    expect(menu.categories.some((c) => c.id === null)).toBe(false);
  });
});
