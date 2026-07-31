import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { ProductRow } from '../domain/product.interface';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    findAvailableForSale: jest.Mock;
    update: jest.Mock;
    setActive: jest.Mock;
    setCurrentCost: jest.Mock;
    softDelete: jest.Mock;
    existsBySku: jest.Mock;
  };
  let categoriesService: { findOne: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: ProductsService;

  const businessId = 'business-1';

  function makeRow(overrides: Partial<ProductRow> = {}): ProductRow {
    return {
      id: 'product-1',
      business_id: businessId,
      category_id: null,
      name: 'Classic Burger',
      description: null,
      sku: null,
      sale_price: '25000.00',
      current_cost: '0.00',
      image_url: null,
      is_active: true,
      track_inventory: true,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAvailableForSale: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
      setCurrentCost: jest.fn(),
      softDelete: jest.fn(),
      existsBySku: jest.fn(),
    };
    categoriesService = { findOne: jest.fn() };
    auditService = { record: jest.fn() };
    service = new ProductsService(
      repository,
      categoriesService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('validates the category belongs to the business when provided', async () => {
      categoriesService.findOne.mockResolvedValue({ id: 'cat-1' });
      repository.create.mockResolvedValue(makeRow({ category_id: 'cat-1' }));

      await service.create({
        businessId,
        name: 'Classic Burger',
        categoryId: 'cat-1',
      });

      expect(categoriesService.findOne).toHaveBeenCalledWith(
        businessId,
        'cat-1',
      );
    });

    it('rejects a duplicate SKU', async () => {
      repository.existsBySku.mockResolvedValue(true);

      await expect(
        service.create({ businessId, name: 'Classic Burger', sku: 'BRG-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('parses sale_price/current_cost NUMERIC strings into numbers', async () => {
      repository.create.mockResolvedValue(makeRow({ sale_price: '25000.50' }));

      const product = await service.create({
        businessId,
        name: 'Classic Burger',
      });

      expect(product.salePrice).toBe(25000.5);
      expect(typeof product.salePrice).toBe('number');
    });
  });

  describe('getMargin', () => {
    it('computes margin amount and percent, rounded to 2 decimals', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ sale_price: '25000.50', current_cost: '3.58' }),
      );

      const margin = await service.getMargin(businessId, 'product-1');

      expect(margin.salePrice).toBe(25000.5);
      expect(margin.currentCost).toBe(3.58);
      expect(margin.marginAmount).toBe(24996.92);
      expect(margin.marginPercent).toBeCloseTo(99.99, 1);
    });

    it('returns 0% margin when sale price is 0 (avoids division by zero)', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ sale_price: '0', current_cost: '0' }),
      );

      const margin = await service.getMargin(businessId, 'product-1');

      expect(margin.marginPercent).toBe(0);
    });
  });

  describe('syncCostFromRecipe', () => {
    it('rounds the cost to 2 decimals before persisting', async () => {
      await service.syncCostFromRecipe(businessId, 'product-1', 3.5789);

      expect(repository.setCurrentCost).toHaveBeenCalledWith(
        'product-1',
        businessId,
        3.58,
        undefined,
      );
    });
  });

  describe('softDelete', () => {
    it('throws EntityNotFoundException when nothing was deleted', async () => {
      repository.softDelete.mockResolvedValue(null);

      await expect(service.softDelete(businessId, 'product-1')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('findAvailableForSale', () => {
    it('maps every row to the public Product shape', async () => {
      repository.findAvailableForSale.mockResolvedValue([makeRow()]);

      const products = await service.findAvailableForSale(businessId);

      expect(products).toHaveLength(1);
      expect(products[0].id).toBe('product-1');
    });
  });
});
