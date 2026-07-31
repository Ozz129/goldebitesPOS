import {
  BusinessRuleException,
  InvalidOrderStatusTransitionException,
} from '../../../common/exceptions';
import { InventoryMovementType } from '../../inventory-movements/domain/inventory-movement.types';
import {
  OrderItemRow,
  OrderRow,
  OrderStatus,
  OrderType,
} from '../domain/order.interface';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    findActiveForKitchen: jest.Mock;
    addItems: jest.Mock;
    replaceItems: jest.Mock;
    findItems: jest.Mock;
    updateTotals: jest.Mock;
    setStatus: jest.Mock;
    updatePaymentStatus: jest.Mock;
    addStatusHistory: jest.Mock;
    findStatusHistory: jest.Mock;
    getActiveCount: jest.Mock;
    getSalesSummary: jest.Mock;
    getSalesByDay: jest.Mock;
    getTopProducts: jest.Mock;
  };
  let branchesService: { findOne: jest.Mock };
  let productsService: { getOwnedOrFail: jest.Mock };
  let recipesService: { findByProductOrNull: jest.Mock };
  let customersService: {
    getOwnedOrFail: jest.Mock;
    recordCompletedOrder: jest.Mock;
  };
  let movementsService: {
    recordMovement: jest.Mock;
    getMovementsByReference: jest.Mock;
  };
  let businessesService: { getTaxRate: jest.Mock };
  let loyaltyService: { awardPointsForOrder: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: OrdersService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const productId = 'product-1';

  function makeOrderRow(overrides: Partial<OrderRow> = {}): OrderRow {
    return {
      id: 'order-1',
      business_id: businessId,
      branch_id: branchId,
      customer_id: null,
      created_by: null,
      order_number: '1',
      order_type: OrderType.DINE_IN,
      status: OrderStatus.PENDING,
      payment_status: 'PENDING' as never,
      table_number: null,
      delivery_address: null,
      delivery_instructions: null,
      subtotal: '10000.00',
      discount_amount: '0.00',
      tax_amount: '0.00',
      delivery_fee: '0.00',
      total_amount: '10000.00',
      notes: null,
      confirmed_at: null,
      prepared_at: null,
      delivered_at: null,
      cancelled_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  function makeItemRow(overrides: Partial<OrderItemRow> = {}): OrderItemRow {
    return {
      id: 'item-1',
      order_id: 'order-1',
      product_id: productId,
      product_name_snapshot: 'Burger',
      quantity: '2.000',
      unit_price: '5000.00',
      unit_cost_snapshot: '2000.00',
      discount_amount: '0.00',
      total_price: '10000.00',
      notes: null,
      created_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
      findActiveForKitchen: jest.fn().mockResolvedValue([]),
      addItems: jest.fn(),
      replaceItems: jest.fn(),
      findItems: jest.fn().mockResolvedValue([]),
      updateTotals: jest.fn(),
      setStatus: jest.fn(),
      updatePaymentStatus: jest.fn(),
      addStatusHistory: jest.fn(),
      findStatusHistory: jest.fn().mockResolvedValue([]),
      getActiveCount: jest.fn().mockResolvedValue(0),
      getSalesSummary: jest
        .fn()
        .mockResolvedValue({ order_count: '0', total_amount: null }),
      getSalesByDay: jest.fn().mockResolvedValue([]),
      getTopProducts: jest.fn().mockResolvedValue([]),
    };
    branchesService = {
      findOne: jest.fn().mockResolvedValue({ id: branchId }),
    };
    productsService = {
      getOwnedOrFail: jest.fn().mockResolvedValue({
        id: productId,
        name: 'Burger',
        sale_price: '5000.00',
        current_cost: '2000.00',
        track_inventory: false,
      }),
    };
    recipesService = { findByProductOrNull: jest.fn().mockResolvedValue(null) };
    customersService = {
      getOwnedOrFail: jest.fn().mockResolvedValue({ id: 'customer-1' }),
      recordCompletedOrder: jest.fn(),
    };
    movementsService = {
      recordMovement: jest.fn().mockResolvedValue({}),
      getMovementsByReference: jest.fn().mockResolvedValue([]),
    };
    businessesService = { getTaxRate: jest.fn().mockResolvedValue(0) };
    loyaltyService = { awardPointsForOrder: jest.fn() };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work({}),
      ),
    };
    auditService = { record: jest.fn() };

    service = new OrdersService(
      repository,
      branchesService as never,
      productsService as never,
      recipesService as never,
      customersService as never,
      movementsService as never,
      businessesService as never,
      loyaltyService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('rejects an empty item list', async () => {
      await expect(
        service.create(
          { businessId, branchId, orderType: OrderType.DINE_IN },
          [],
        ),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('computes subtotal/total from unit price * quantity with a 0 tax rate', async () => {
      repository.create.mockResolvedValue(makeOrderRow());

      await service.create(
        { businessId, branchId, orderType: OrderType.DINE_IN },
        [{ productId, quantity: 2 }],
      );

      expect(repository.updateTotals).toHaveBeenCalledWith(
        'order-1',
        10000,
        0,
        0,
        0,
        10000,
        expect.anything(),
      );
    });

    it('applies the business tax rate from Settings (regression: used to be hard-coded to 0)', async () => {
      businessesService.getTaxRate.mockResolvedValue(0.19);
      repository.create.mockResolvedValue(makeOrderRow());

      await service.create(
        { businessId, branchId, orderType: OrderType.DINE_IN },
        [{ productId, quantity: 2 }],
      );

      expect(businessesService.getTaxRate).toHaveBeenCalledWith(businessId);
      expect(repository.updateTotals).toHaveBeenCalledWith(
        'order-1',
        10000,
        0,
        1900,
        0,
        11900,
        expect.anything(),
      );
    });

    it('rejects a per-item discount that exceeds the line total', async () => {
      await expect(
        service.create({ businessId, branchId, orderType: OrderType.DINE_IN }, [
          { productId, quantity: 1, discountAmount: 999999 },
        ]),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('validates the customer belongs to the business when provided', async () => {
      repository.create.mockResolvedValue(
        makeOrderRow({ customer_id: 'customer-1' }),
      );

      await service.create(
        {
          businessId,
          branchId,
          orderType: OrderType.DINE_IN,
          customerId: 'customer-1',
        },
        [{ productId, quantity: 1 }],
      );

      expect(customersService.getOwnedOrFail).toHaveBeenCalledWith(
        businessId,
        'customer-1',
      );
    });
  });

  describe('replaceItems', () => {
    it('rejects editing items once the order is no longer PENDING', async () => {
      repository.findById.mockResolvedValue(
        makeOrderRow({ status: OrderStatus.CONFIRMED }),
      );

      await expect(
        service.replaceItems(businessId, 'order-1', [
          { productId, quantity: 1 },
        ]),
      ).rejects.toThrow(BusinessRuleException);
    });
  });

  describe('updateStatus', () => {
    it('rejects an invalid transition', async () => {
      repository.findById.mockResolvedValue(
        makeOrderRow({ status: OrderStatus.DELIVERED }),
      );

      await expect(
        service.updateStatus(businessId, 'order-1', OrderStatus.CONFIRMED),
      ).rejects.toThrow(InvalidOrderStatusTransitionException);
    });

    it('consumes stock per recipe item when confirming an order for a tracked product', async () => {
      repository.findById.mockResolvedValue(makeOrderRow());
      repository.findItems.mockResolvedValue([makeItemRow()]);
      repository.setStatus.mockResolvedValue(
        makeOrderRow({ status: OrderStatus.CONFIRMED }),
      );
      productsService.getOwnedOrFail.mockResolvedValue({
        id: productId,
        name: 'Burger',
        track_inventory: true,
      });
      recipesService.findByProductOrNull.mockResolvedValue({
        items: [{ inventoryItemId: 'flour-1', quantity: 0.2 }],
        cost: { yieldQuantity: 1 },
      });

      await service.updateStatus(
        businessId,
        'order-1',
        OrderStatus.CONFIRMED,
        'actor-1',
      );

      expect(movementsService.recordMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: InventoryMovementType.SALE_CONSUMPTION,
          inventoryItemId: 'flour-1',
          quantity: 0.4,
          referenceType: 'order',
          referenceId: 'order-1',
        }),
        expect.anything(),
      );
    });

    it('skips stock consumption for products with trackInventory=false', async () => {
      repository.findById.mockResolvedValue(makeOrderRow());
      repository.findItems.mockResolvedValue([makeItemRow()]);
      repository.setStatus.mockResolvedValue(
        makeOrderRow({ status: OrderStatus.CONFIRMED }),
      );

      await service.updateStatus(
        businessId,
        'order-1',
        OrderStatus.CONFIRMED,
        'actor-1',
      );

      expect(movementsService.recordMovement).not.toHaveBeenCalled();
    });

    it('reverses previously consumed stock via RETURN when cancelling a CONFIRMED order', async () => {
      repository.findById.mockResolvedValue(
        makeOrderRow({ status: OrderStatus.CONFIRMED }),
      );
      repository.setStatus.mockResolvedValue(
        makeOrderRow({ status: OrderStatus.CANCELLED }),
      );
      movementsService.getMovementsByReference.mockResolvedValue([
        {
          movementType: InventoryMovementType.SALE_CONSUMPTION,
          inventoryItemId: 'flour-1',
          quantity: 0.4,
          locationId: null,
        },
      ]);

      await service.updateStatus(
        businessId,
        'order-1',
        OrderStatus.CANCELLED,
        'actor-1',
      );

      expect(movementsService.recordMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: InventoryMovementType.RETURN,
          inventoryItemId: 'flour-1',
          quantity: 0.4,
          referenceType: 'order_cancellation',
        }),
        expect.anything(),
      );
    });

    it('does not attempt reversal when cancelling directly from PENDING', async () => {
      repository.findById.mockResolvedValue(
        makeOrderRow({ status: OrderStatus.PENDING }),
      );
      repository.setStatus.mockResolvedValue(
        makeOrderRow({ status: OrderStatus.CANCELLED }),
      );

      await service.updateStatus(
        businessId,
        'order-1',
        OrderStatus.CANCELLED,
        'actor-1',
      );

      expect(movementsService.getMovementsByReference).not.toHaveBeenCalled();
    });

    it('records customer stats when an order tied to a customer is delivered', async () => {
      repository.findById.mockResolvedValue(
        makeOrderRow({ status: OrderStatus.READY, customer_id: 'customer-1' }),
      );
      repository.setStatus.mockResolvedValue(
        makeOrderRow({
          status: OrderStatus.DELIVERED,
          customer_id: 'customer-1',
        }),
      );

      await service.updateStatus(
        businessId,
        'order-1',
        OrderStatus.DELIVERED,
        'actor-1',
      );

      expect(customersService.recordCompletedOrder).toHaveBeenCalledWith(
        'customer-1',
        10000,
        expect.anything(),
      );
    });
  });

  describe('getKitchenQueue', () => {
    it('delegates to the repository with the branch filter', async () => {
      repository.findActiveForKitchen.mockResolvedValue([makeOrderRow()]);

      const queue = await service.getKitchenQueue(businessId, branchId);

      expect(repository.findActiveForKitchen).toHaveBeenCalledWith(
        businessId,
        branchId,
      );
      expect(queue).toHaveLength(1);
    });
  });

  describe('getSalesSummary', () => {
    it('parses order_count/total_amount, defaulting total_amount to 0 when null', async () => {
      repository.getSalesSummary.mockResolvedValue({
        order_count: '3',
        total_amount: null,
      });

      const summary = await service.getSalesSummary(
        businessId,
        branchId,
        '2026-01-01',
        '2026-01-31',
      );

      expect(summary).toEqual({ orderCount: 3, totalAmount: 0 });
    });
  });

  describe('getSalesByDay', () => {
    it('maps rows into DailySales entries', async () => {
      repository.getSalesByDay.mockResolvedValue([
        { date: '2026-01-15', order_count: '2', total_amount: '5000.00' },
      ]);

      const result = await service.getSalesByDay(
        businessId,
        branchId,
        '2026-01-01',
        '2026-01-31',
      );

      expect(result).toEqual([
        { date: '2026-01-15', orderCount: 2, totalAmount: 5000 },
      ]);
    });
  });

  describe('getTopProducts', () => {
    it('maps rows into TopProduct entries', async () => {
      repository.getTopProducts.mockResolvedValue([
        {
          product_id: 'product-1',
          product_name: 'Burger',
          quantity_sold: '10.000',
          revenue: '50000.00',
        },
      ]);

      const result = await service.getTopProducts(
        businessId,
        branchId,
        '2026-01-01',
        '2026-01-31',
        5,
      );

      expect(result).toEqual([
        {
          productId: 'product-1',
          productName: 'Burger',
          quantitySold: 10,
          revenue: 50000,
        },
      ]);
    });
  });
});
