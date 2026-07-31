import { BusinessRuleException } from '../../../common/exceptions';
import { InventoryMovementType } from '../../inventory-movements/domain/inventory-movement.types';
import { PurchaseOrderStatus } from '../../purchases/domain/purchase-order.interface';
import { GoodsReceiptRow } from '../domain/goods-receipt.interface';
import { GoodsReceiptsService } from './goods-receipts.service';

describe('GoodsReceiptsService', () => {
  let repository: {
    create: jest.Mock;
    addItems: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    findItems: jest.Mock;
  };
  let purchaseOrdersService: {
    findOne: jest.Mock;
    getItemForReceipt: jest.Mock;
    isFullyReceived: jest.Mock;
    syncStatusAfterReceipt: jest.Mock;
  };
  let inventoryItemsService: { syncCostFromPurchase: jest.Mock };
  let movementsService: { recordMovement: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: GoodsReceiptsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const purchaseOrderId = 'po-1';

  function makeRow(overrides: Partial<GoodsReceiptRow> = {}): GoodsReceiptRow {
    return {
      id: 'receipt-1',
      business_id: businessId,
      branch_id: branchId,
      purchase_order_id: purchaseOrderId,
      received_by: null,
      received_at: new Date(),
      notes: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      addItems: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
      findItems: jest.fn().mockResolvedValue([]),
    };
    purchaseOrdersService = {
      findOne: jest.fn().mockResolvedValue({
        id: purchaseOrderId,
        branchId,
        status: PurchaseOrderStatus.APPROVED,
      }),
      getItemForReceipt: jest.fn().mockResolvedValue({
        inventoryItemId: 'item-1',
        quantity: 50,
        receivedQuantity: 0,
      }),
      isFullyReceived: jest.fn().mockResolvedValue(false),
      syncStatusAfterReceipt: jest.fn(),
    };
    inventoryItemsService = { syncCostFromPurchase: jest.fn() };
    movementsService = { recordMovement: jest.fn().mockResolvedValue({}) };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work({}),
      ),
    };
    auditService = { record: jest.fn() };

    service = new GoodsReceiptsService(
      repository,
      purchaseOrdersService as never,
      inventoryItemsService as never,
      movementsService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('receive', () => {
    it('rejects an empty item list', async () => {
      await expect(
        service.receive(businessId, purchaseOrderId, [], undefined),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects when the purchase order status is not receivable', async () => {
      purchaseOrdersService.findOne.mockResolvedValue({
        id: purchaseOrderId,
        branchId,
        status: PurchaseOrderStatus.DRAFT,
      });

      await expect(
        service.receive(
          businessId,
          purchaseOrderId,
          [{ purchaseOrderItemId: 'poi-1', quantityReceived: 10, unitCost: 2 }],
          undefined,
        ),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects duplicate purchase order items in the same receipt', async () => {
      await expect(
        service.receive(
          businessId,
          purchaseOrderId,
          [
            { purchaseOrderItemId: 'poi-1', quantityReceived: 10, unitCost: 2 },
            { purchaseOrderItemId: 'poi-1', quantityReceived: 5, unitCost: 2 },
          ],
          undefined,
        ),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects receiving more than what remains on the purchase order item', async () => {
      purchaseOrdersService.getItemForReceipt.mockResolvedValue({
        inventoryItemId: 'item-1',
        quantity: 50,
        receivedQuantity: 45,
      });

      await expect(
        service.receive(
          businessId,
          purchaseOrderId,
          [{ purchaseOrderItemId: 'poi-1', quantityReceived: 10, unitCost: 2 }],
          undefined,
        ),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('records a PURCHASE movement and syncs cost for each item', async () => {
      repository.create.mockResolvedValue(makeRow());

      await service.receive(
        businessId,
        purchaseOrderId,
        [
          {
            purchaseOrderItemId: 'poi-1',
            quantityReceived: 20,
            unitCost: 2.75,
          },
        ],
        undefined,
        'actor-1',
      );

      expect(movementsService.recordMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: InventoryMovementType.PURCHASE,
          inventoryItemId: 'item-1',
          quantity: 20,
          unitCost: 2.75,
        }),
        expect.anything(),
      );
      expect(inventoryItemsService.syncCostFromPurchase).toHaveBeenCalledWith(
        businessId,
        'item-1',
        2.75,
        expect.anything(),
      );
    });

    it('syncs the purchase order status based on isFullyReceived', async () => {
      repository.create.mockResolvedValue(makeRow());
      purchaseOrdersService.isFullyReceived.mockResolvedValue(true);

      await service.receive(
        businessId,
        purchaseOrderId,
        [{ purchaseOrderItemId: 'poi-1', quantityReceived: 30, unitCost: 3 }],
        undefined,
      );

      expect(purchaseOrdersService.syncStatusAfterReceipt).toHaveBeenCalledWith(
        businessId,
        purchaseOrderId,
        true,
        expect.anything(),
      );
    });
  });
});
