import { InsufficientStockException } from '../../../common/exceptions';
import { InventoryMovementRow } from '../domain/inventory-movement.interface';
import { InventoryMovementType } from '../domain/inventory-movement.types';
import { InventoryMovementsService } from './inventory-movements.service';

describe('InventoryMovementsService', () => {
  let repository: {
    create: jest.Mock;
    findAll: jest.Mock;
    getStock: jest.Mock;
    getStockForItem: jest.Mock;
    getLowStock: jest.Mock;
    findByReference: jest.Mock;
  };
  let inventoryItemsService: { getOwnedOrFail: jest.Mock };
  let branchesService: { findOne: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: InventoryMovementsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const inventoryItemId = 'item-1';

  function makeRow(
    overrides: Partial<InventoryMovementRow> = {},
  ): InventoryMovementRow {
    return {
      id: 'mov-1',
      business_id: businessId,
      branch_id: branchId,
      location_id: null,
      inventory_item_id: inventoryItemId,
      movement_type: InventoryMovementType.ADJUSTMENT_IN,
      quantity: '10.000',
      unit_cost: null,
      reference_type: null,
      reference_id: null,
      notes: null,
      created_by: null,
      created_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
      getStock: jest.fn().mockResolvedValue([]),
      getStockForItem: jest.fn().mockResolvedValue(0),
      getLowStock: jest.fn().mockResolvedValue([]),
      findByReference: jest.fn().mockResolvedValue([]),
    };
    inventoryItemsService = {
      getOwnedOrFail: jest
        .fn()
        .mockResolvedValue({ id: inventoryItemId, name: 'Flour' }),
    };
    branchesService = {
      findOne: jest.fn().mockResolvedValue({ id: branchId }),
    };
    auditService = { record: jest.fn() };

    service = new InventoryMovementsService(
      repository,
      inventoryItemsService as never,
      branchesService as never,
      auditService as never,
    );
  });

  describe('recordMovement', () => {
    it('allows inbound movements without checking stock', async () => {
      repository.create.mockResolvedValue(makeRow());

      await service.recordMovement({
        businessId,
        branchId,
        inventoryItemId,
        movementType: InventoryMovementType.PURCHASE,
        quantity: 10,
      });

      expect(repository.getStockForItem).not.toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalled();
    });

    it('throws InsufficientStockException when outbound quantity exceeds available stock', async () => {
      repository.getStockForItem.mockResolvedValue(5);

      await expect(
        service.recordMovement({
          businessId,
          branchId,
          inventoryItemId,
          movementType: InventoryMovementType.WASTE,
          quantity: 10,
        }),
      ).rejects.toThrow(InsufficientStockException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('allows an outbound movement exactly equal to available stock', async () => {
      repository.getStockForItem.mockResolvedValue(10);
      repository.create.mockResolvedValue(
        makeRow({ movement_type: InventoryMovementType.SALE_CONSUMPTION }),
      );

      await service.recordMovement({
        businessId,
        branchId,
        inventoryItemId,
        movementType: InventoryMovementType.SALE_CONSUMPTION,
        quantity: 10,
      });

      expect(repository.create).toHaveBeenCalled();
    });

    it('passes the transactional client through to the repository', async () => {
      const client = {} as never;
      repository.create.mockResolvedValue(makeRow());

      await service.recordMovement(
        {
          businessId,
          branchId,
          inventoryItemId,
          movementType: InventoryMovementType.ADJUSTMENT_IN,
          quantity: 1,
        },
        client,
      );

      expect(repository.create).toHaveBeenCalledWith(expect.anything(), client);
    });
  });

  describe('createAdjustment', () => {
    it('maps direction IN to ADJUSTMENT_IN', async () => {
      repository.create.mockResolvedValue(makeRow());

      await service.createAdjustment({
        businessId,
        branchId,
        inventoryItemId,
        direction: 'IN',
        quantity: 5,
        reason: 'Initial stock',
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: InventoryMovementType.ADJUSTMENT_IN,
        }),
        undefined,
      );
    });

    it('maps direction OUT to ADJUSTMENT_OUT and validates stock', async () => {
      repository.getStockForItem.mockResolvedValue(2);

      await expect(
        service.createAdjustment({
          businessId,
          branchId,
          inventoryItemId,
          direction: 'OUT',
          quantity: 5,
          reason: 'Waste',
        }),
      ).rejects.toThrow(InsufficientStockException);
    });
  });

  describe('getStockForItem', () => {
    it('delegates to the repository', async () => {
      repository.getStockForItem.mockResolvedValue(42);

      const result = await service.getStockForItem(
        businessId,
        branchId,
        inventoryItemId,
      );

      expect(result).toBe(42);
    });
  });
});
