import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { InventoryMovementType } from '../../inventory-movements/domain/inventory-movement.types';
import {
  CountStatus,
  InventoryCountItemRow,
  InventoryCountRow,
} from '../domain/inventory-count.interface';
import { InventoryCountsService } from './inventory-counts.service';

describe('InventoryCountsService', () => {
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    addItems: jest.Mock;
    findItems: jest.Mock;
    findItem: jest.Mock;
    recordCountedQuantity: jest.Mock;
    setStatus: jest.Mock;
  };
  let branchesService: { findOne: jest.Mock };
  let inventoryItemsService: { getOwnedOrFail: jest.Mock };
  let movementsService: {
    getStockForItem: jest.Mock;
    recordMovement: jest.Mock;
  };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: InventoryCountsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';

  function makeRow(
    overrides: Partial<InventoryCountRow> = {},
  ): InventoryCountRow {
    return {
      id: 'count-1',
      business_id: businessId,
      branch_id: branchId,
      location_id: null,
      status: CountStatus.IN_PROGRESS,
      started_by: null,
      started_at: new Date(),
      completed_by: null,
      completed_at: null,
      notes: null,
      ...overrides,
    };
  }

  function makeItemRow(
    overrides: Partial<InventoryCountItemRow> = {},
  ): InventoryCountItemRow {
    return {
      id: 'ci-1',
      count_id: 'count-1',
      inventory_item_id: 'item-1',
      inventory_item_name: 'Flour',
      unit: 'kg',
      expected_quantity: '100.000',
      counted_quantity: null,
      counted_at: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
      addItems: jest.fn(),
      findItems: jest.fn().mockResolvedValue([]),
      findItem: jest.fn(),
      recordCountedQuantity: jest.fn(),
      setStatus: jest.fn(),
    };
    branchesService = {
      findOne: jest.fn().mockResolvedValue({ id: branchId }),
    };
    inventoryItemsService = {
      getOwnedOrFail: jest.fn().mockResolvedValue({ id: 'item-1' }),
    };
    movementsService = {
      getStockForItem: jest.fn().mockResolvedValue(100),
      recordMovement: jest.fn().mockResolvedValue({}),
    };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work({}),
      ),
    };
    auditService = { record: jest.fn() };

    service = new InventoryCountsService(
      repository,
      branchesService as never,
      inventoryItemsService as never,
      movementsService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('start', () => {
    it('rejects an empty item list', async () => {
      await expect(
        service.start({ businessId, branchId, inventoryItemIds: [] }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects duplicate item ids', async () => {
      await expect(
        service.start({
          businessId,
          branchId,
          inventoryItemIds: ['item-1', 'item-1'],
        }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('snapshots expected quantity from current stock for each item', async () => {
      repository.create.mockResolvedValue(makeRow());
      movementsService.getStockForItem.mockResolvedValue(42);

      await service.start({
        businessId,
        branchId,
        inventoryItemIds: ['item-1'],
      });

      expect(repository.addItems).toHaveBeenCalledWith(
        'count-1',
        [{ inventoryItemId: 'item-1', expectedQuantity: 42 }],
        expect.anything(),
      );
    });
  });

  describe('recordCount', () => {
    it('rejects recording when the count is not IN_PROGRESS', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: CountStatus.COMPLETED }),
      );

      await expect(
        service.recordCount(businessId, 'count-1', 'item-1', 50),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('throws EntityNotFoundException when the item is not part of the count', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.findItem.mockResolvedValue(null);

      await expect(
        service.recordCount(businessId, 'count-1', 'item-1', 50),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('complete', () => {
    it('posts ADJUSTMENT_IN when counted quantity exceeds expected', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.findItems.mockResolvedValue([
        makeItemRow({
          expected_quantity: '100.000',
          counted_quantity: '110.000',
        }),
      ]);
      repository.setStatus.mockResolvedValue(
        makeRow({ status: CountStatus.COMPLETED }),
      );

      await service.complete(businessId, 'count-1', 'actor-1');

      expect(movementsService.recordMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: InventoryMovementType.ADJUSTMENT_IN,
          quantity: 10,
        }),
        expect.anything(),
      );
    });

    it('posts ADJUSTMENT_OUT when counted quantity is below expected', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.findItems.mockResolvedValue([
        makeItemRow({
          expected_quantity: '100.000',
          counted_quantity: '75.000',
        }),
      ]);
      repository.setStatus.mockResolvedValue(
        makeRow({ status: CountStatus.COMPLETED }),
      );

      await service.complete(businessId, 'count-1', 'actor-1');

      expect(movementsService.recordMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: InventoryMovementType.ADJUSTMENT_OUT,
          quantity: 25,
        }),
        expect.anything(),
      );
    });

    it('skips items with no recorded difference and items never counted', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.findItems.mockResolvedValue([
        makeItemRow({
          expected_quantity: '100.000',
          counted_quantity: '100.000',
        }),
        makeItemRow({ id: 'ci-2', counted_quantity: null }),
      ]);
      repository.setStatus.mockResolvedValue(
        makeRow({ status: CountStatus.COMPLETED }),
      );

      await service.complete(businessId, 'count-1', 'actor-1');

      expect(movementsService.recordMovement).not.toHaveBeenCalled();
    });

    it('rejects completing a count that is not IN_PROGRESS', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: CountStatus.CANCELLED }),
      );

      await expect(service.complete(businessId, 'count-1')).rejects.toThrow(
        BusinessRuleException,
      );
    });
  });

  describe('cancel', () => {
    it('rejects cancelling a count that is not IN_PROGRESS', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: CountStatus.COMPLETED }),
      );

      await expect(service.cancel(businessId, 'count-1')).rejects.toThrow(
        BusinessRuleException,
      );
    });
  });
});
