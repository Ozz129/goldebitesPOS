import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import {
  PurchaseOrderItemRow,
  PurchaseOrderRow,
  PurchaseOrderStatus,
} from '../domain/purchase-order.interface';
import { PurchaseOrdersService } from './purchase-orders.service';

describe('PurchaseOrdersService', () => {
  let repository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    addItems: jest.Mock;
    updateTotals: jest.Mock;
    findItems: jest.Mock;
    findItemById: jest.Mock;
    setStatus: jest.Mock;
    hasReceipts: jest.Mock;
  };
  let branchesService: { findOne: jest.Mock };
  let suppliersService: { findOne: jest.Mock };
  let inventoryItemsService: { getOwnedOrFail: jest.Mock };
  let businessesService: { getTaxRate: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: PurchaseOrdersService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const supplierId = 'supplier-1';

  function makeRow(
    overrides: Partial<PurchaseOrderRow> = {},
  ): PurchaseOrderRow {
    return {
      id: 'po-1',
      business_id: businessId,
      branch_id: branchId,
      supplier_id: supplierId,
      order_number: 'PO-000001',
      status: PurchaseOrderStatus.DRAFT,
      order_date: '2026-01-01',
      expected_date: null,
      subtotal: '125.00',
      tax_amount: '0.00',
      total_amount: '125.00',
      notes: null,
      created_by: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  function makeItemRow(
    overrides: Partial<PurchaseOrderItemRow> = {},
  ): PurchaseOrderItemRow {
    return {
      id: 'poi-1',
      purchase_order_id: 'po-1',
      inventory_item_id: 'item-1',
      inventory_item_name: 'Flour',
      unit: 'kg',
      quantity: '50.000',
      unit_cost: '2.50',
      total_cost: '125.00',
      received_quantity: '0',
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
      findById: jest.fn(),
      addItems: jest.fn(),
      updateTotals: jest.fn(),
      findItems: jest.fn().mockResolvedValue([]),
      findItemById: jest.fn(),
      setStatus: jest.fn(),
      hasReceipts: jest.fn().mockResolvedValue(false),
    };
    branchesService = {
      findOne: jest.fn().mockResolvedValue({ id: branchId }),
    };
    suppliersService = {
      findOne: jest.fn().mockResolvedValue({ id: supplierId }),
    };
    inventoryItemsService = {
      getOwnedOrFail: jest.fn().mockResolvedValue({ id: 'item-1' }),
    };
    businessesService = { getTaxRate: jest.fn().mockResolvedValue(0) };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work({}),
      ),
    };
    auditService = { record: jest.fn() };

    service = new PurchaseOrdersService(
      repository,
      branchesService as never,
      suppliersService as never,
      inventoryItemsService as never,
      businessesService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('rejects an empty item list', async () => {
      await expect(
        service.create({ businessId, branchId, supplierId }, []),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects duplicate inventory items', async () => {
      await expect(
        service.create({ businessId, branchId, supplierId }, [
          { inventoryItemId: 'item-1', quantity: 1, unitCost: 1 },
          { inventoryItemId: 'item-1', quantity: 2, unitCost: 1 },
        ]),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('computes subtotal and total from quantity * unitCost', async () => {
      repository.create.mockResolvedValue(makeRow());

      await service.create({ businessId, branchId, supplierId }, [
        { inventoryItemId: 'item-1', quantity: 50, unitCost: 2.5 },
      ]);

      expect(repository.updateTotals).toHaveBeenCalledWith(
        'po-1',
        125,
        0,
        125,
        expect.anything(),
      );
    });

    it('applies the business tax rate from Settings (regression: used to be hard-coded to 0)', async () => {
      businessesService.getTaxRate.mockResolvedValue(0.19);
      repository.create.mockResolvedValue(makeRow());

      await service.create({ businessId, branchId, supplierId }, [
        { inventoryItemId: 'item-1', quantity: 10, unitCost: 100 },
      ]);

      expect(businessesService.getTaxRate).toHaveBeenCalledWith(businessId);
      expect(repository.updateTotals).toHaveBeenCalledWith(
        'po-1',
        1000,
        190,
        1190,
        expect.anything(),
      );
    });
  });

  describe('submit / approve', () => {
    it('submits a DRAFT order', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.setStatus.mockResolvedValue(
        makeRow({ status: PurchaseOrderStatus.SUBMITTED }),
      );

      const result = await service.submit(businessId, 'po-1');

      expect(result.status).toBe(PurchaseOrderStatus.SUBMITTED);
    });

    it('rejects submitting a non-DRAFT order', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: PurchaseOrderStatus.APPROVED }),
      );

      await expect(service.submit(businessId, 'po-1')).rejects.toThrow(
        BusinessRuleException,
      );
    });

    it('rejects approving a non-SUBMITTED order', async () => {
      repository.findById.mockResolvedValue(makeRow());

      await expect(service.approve(businessId, 'po-1')).rejects.toThrow(
        BusinessRuleException,
      );
    });
  });

  describe('cancel', () => {
    it('cancels a DRAFT order', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.setStatus.mockResolvedValue(
        makeRow({ status: PurchaseOrderStatus.CANCELLED }),
      );

      const result = await service.cancel(businessId, 'po-1');

      expect(result.status).toBe(PurchaseOrderStatus.CANCELLED);
    });

    it('rejects cancelling a RECEIVED order', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: PurchaseOrderStatus.RECEIVED }),
      );

      await expect(service.cancel(businessId, 'po-1')).rejects.toThrow(
        BusinessRuleException,
      );
    });

    it('rejects cancelling an APPROVED order that already has receipts', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: PurchaseOrderStatus.APPROVED }),
      );
      repository.hasReceipts.mockResolvedValue(true);

      await expect(service.cancel(businessId, 'po-1')).rejects.toThrow(
        BusinessRuleException,
      );
    });

    it('allows cancelling an APPROVED order with no receipts yet', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: PurchaseOrderStatus.APPROVED }),
      );
      repository.hasReceipts.mockResolvedValue(false);
      repository.setStatus.mockResolvedValue(
        makeRow({ status: PurchaseOrderStatus.CANCELLED }),
      );

      const result = await service.cancel(businessId, 'po-1');

      expect(result.status).toBe(PurchaseOrderStatus.CANCELLED);
    });
  });

  describe('getItemForReceipt', () => {
    it('throws EntityNotFoundException when the item does not belong to the order', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.findItemById.mockResolvedValue(
        makeItemRow({ purchase_order_id: 'other-po' }),
      );

      await expect(
        service.getItemForReceipt(businessId, 'po-1', 'poi-1'),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('parses quantity and receivedQuantity as numbers', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.findItemById.mockResolvedValue(
        makeItemRow({ quantity: '50.000', received_quantity: '20' }),
      );

      const result = await service.getItemForReceipt(
        businessId,
        'po-1',
        'poi-1',
      );

      expect(result).toEqual({
        inventoryItemId: 'item-1',
        quantity: 50,
        receivedQuantity: 20,
      });
    });
  });

  describe('isFullyReceived', () => {
    it('is true only when every item received quantity meets the ordered quantity', async () => {
      repository.findItems.mockResolvedValue([
        makeItemRow({ quantity: '50.000', received_quantity: '50' }),
      ]);

      expect(await service.isFullyReceived('po-1')).toBe(true);
    });

    it('is false when at least one item is still short', async () => {
      repository.findItems.mockResolvedValue([
        makeItemRow({ quantity: '50.000', received_quantity: '20' }),
      ]);

      expect(await service.isFullyReceived('po-1')).toBe(false);
    });
  });

  describe('syncStatusAfterReceipt', () => {
    it('sets RECEIVED when fully received', async () => {
      await service.syncStatusAfterReceipt(businessId, 'po-1', true);

      expect(repository.setStatus).toHaveBeenCalledWith(
        'po-1',
        businessId,
        PurchaseOrderStatus.RECEIVED,
        undefined,
      );
    });

    it('sets PARTIALLY_RECEIVED when not fully received', async () => {
      await service.syncStatusAfterReceipt(businessId, 'po-1', false);

      expect(repository.setStatus).toHaveBeenCalledWith(
        'po-1',
        businessId,
        PurchaseOrderStatus.PARTIALLY_RECEIVED,
        undefined,
      );
    });
  });
});
