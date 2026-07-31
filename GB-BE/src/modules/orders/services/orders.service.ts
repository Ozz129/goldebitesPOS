import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  EntityNotFoundException,
  InvalidOrderStatusTransitionException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { BusinessesService } from '../../businesses/services/businesses.service';
import { CustomersService } from '../../customers/services/customers.service';
import { InventoryMovementType } from '../../inventory-movements/domain/inventory-movement.types';
import { InventoryMovementsService } from '../../inventory-movements/services/inventory-movements.service';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';
import { ProductsService } from '../../products/services/products.service';
import { RecipesService } from '../../recipes/services/recipes.service';
import {
  DailySales,
  Order,
  OrderRow,
  OrderStatus,
  OrderWithItems,
  SalesSummary,
  TopProduct,
} from '../domain/order.interface';
import {
  CreateOrderData,
  OrderItemComputed,
  OrderItemInput,
  OrderQuery,
} from '../domain/order.types';
import { OrderMapper } from '../mappers/order.mapper';
import { ORDERS_REPOSITORY } from '../repositories/orders.repository.interface';
import type { IOrdersRepository } from '../repositories/orders.repository.interface';

/** Target status -> the order column that records when it was reached (null = no dedicated column). */
const STATUS_TIMESTAMP_COLUMN: Record<OrderStatus, string | null> = {
  [OrderStatus.PENDING]: null,
  [OrderStatus.CONFIRMED]: 'confirmed_at',
  [OrderStatus.PREPARING]: null,
  [OrderStatus.READY]: 'prepared_at',
  [OrderStatus.DELIVERED]: 'delivered_at',
  [OrderStatus.CANCELLED]: 'cancelled_at',
};

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: IOrdersRepository,
    private readonly branchesService: BranchesService,
    private readonly productsService: ProductsService,
    private readonly recipesService: RecipesService,
    private readonly customersService: CustomersService,
    private readonly movementsService: InventoryMovementsService,
    private readonly businessesService: BusinessesService,
    private readonly loyaltyService: LoyaltyService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateOrderData,
    items: OrderItemInput[],
    actorUserId?: string,
  ): Promise<OrderWithItems> {
    if (items.length === 0) {
      throw new BusinessRuleException(
        'An order must include at least one item',
        'ORDER_EMPTY',
      );
    }

    await this.branchesService.findOne(data.businessId, data.branchId);
    if (data.customerId) {
      await this.customersService.getOwnedOrFail(
        data.businessId,
        data.customerId,
      );
    }

    const computedItems = await this.computeItems(data.businessId, items);
    const taxRate = await this.businessesService.getTaxRate(data.businessId);
    const totals = this.computeTotals(
      computedItems,
      data.discountAmount ?? 0,
      data.deliveryFee ?? 0,
      taxRate,
    );

    const row = await this.transactionService.execute(async (client) => {
      const created = await this.ordersRepository.create(
        data,
        actorUserId,
        client,
      );
      await this.ordersRepository.addItems(created.id, computedItems, client);
      await this.ordersRepository.updateTotals(
        created.id,
        totals.subtotal,
        totals.discountAmount,
        totals.taxAmount,
        totals.deliveryFee,
        totals.totalAmount,
        client,
      );
      await this.ordersRepository.addStatusHistory(
        created.id,
        null,
        OrderStatus.PENDING,
        actorUserId,
        undefined,
        client,
      );
      return created;
    });

    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'order',
      entityId: row.id,
      action: 'CREATE',
      newValues: {
        orderNumber: row.order_number,
        totalAmount: totals.totalAmount,
      },
    });

    return this.buildWithItems({ ...row, ...totalsToRow(totals) });
  }

  async findAll(query: OrderQuery): Promise<PaginatedResult<Order>> {
    const { rows, total } = await this.ordersRepository.findAll(query);
    return {
      data: rows.map((row) => OrderMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(businessId: string, id: string): Promise<OrderWithItems> {
    const row = await this.getOwnedOrFail(businessId, id);
    return this.buildWithItems(row);
  }

  /** Used by KitchenService: orders CONFIRMED/PREPARING, oldest first. */
  async getKitchenQueue(
    businessId: string,
    branchId?: string,
  ): Promise<Order[]> {
    const rows = await this.ordersRepository.findActiveForKitchen(
      businessId,
      branchId,
    );
    return rows.map((row) => OrderMapper.toDomain(row));
  }

  /** Used by DashboardService: orders still in the pipeline (not DELIVERED/CANCELLED). */
  async getActiveCount(businessId: string, branchId?: string): Promise<number> {
    return this.ordersRepository.getActiveCount(businessId, branchId);
  }

  /** Used by DashboardService: completed (DELIVERED) sales within a date range. */
  async getSalesSummary(
    businessId: string,
    branchId: string | undefined,
    dateFrom: string,
    dateTo: string,
  ): Promise<SalesSummary> {
    const row = await this.ordersRepository.getSalesSummary(
      businessId,
      branchId,
      dateFrom,
      dateTo,
    );
    return {
      orderCount: parseInt(row.order_count, 10),
      totalAmount: row.total_amount ? parseFloat(row.total_amount) : 0,
    };
  }

  /** Used by AnalyticsService: completed sales grouped by calendar day. */
  async getSalesByDay(
    businessId: string,
    branchId: string | undefined,
    dateFrom: string,
    dateTo: string,
  ): Promise<DailySales[]> {
    const rows = await this.ordersRepository.getSalesByDay(
      businessId,
      branchId,
      dateFrom,
      dateTo,
    );
    return rows.map((row) => ({
      date: row.date,
      orderCount: parseInt(row.order_count, 10),
      totalAmount: parseFloat(row.total_amount),
    }));
  }

  /** Used by AnalyticsService: best-selling products by revenue within a date range. */
  async getTopProducts(
    businessId: string,
    branchId: string | undefined,
    dateFrom: string,
    dateTo: string,
    limit: number,
  ): Promise<TopProduct[]> {
    const rows = await this.ordersRepository.getTopProducts(
      businessId,
      branchId,
      dateFrom,
      dateTo,
      limit,
    );
    return rows.map((row) => ({
      productId: row.product_id,
      productName: row.product_name,
      quantitySold: parseFloat(row.quantity_sold),
      revenue: parseFloat(row.revenue),
    }));
  }

  async replaceItems(
    businessId: string,
    id: string,
    items: OrderItemInput[],
    actorUserId?: string,
  ): Promise<OrderWithItems> {
    if (items.length === 0) {
      throw new BusinessRuleException(
        'An order must include at least one item',
        'ORDER_EMPTY',
      );
    }
    const order = await this.getOwnedOrFail(businessId, id);
    if (order.status !== OrderStatus.PENDING) {
      throw new BusinessRuleException(
        'Order items can only be edited while the order is PENDING',
        'ORDER_NOT_EDITABLE',
      );
    }

    const computedItems = await this.computeItems(businessId, items);
    const taxRate = await this.businessesService.getTaxRate(businessId);
    const totals = this.computeTotals(
      computedItems,
      parseFloat(order.discount_amount),
      parseFloat(order.delivery_fee),
      taxRate,
    );

    await this.transactionService.execute(async (client) => {
      await this.ordersRepository.replaceItems(id, computedItems, client);
      await this.ordersRepository.updateTotals(
        id,
        totals.subtotal,
        totals.discountAmount,
        totals.taxAmount,
        totals.deliveryFee,
        totals.totalAmount,
        client,
      );
    });

    await this.auditService.record({
      businessId,
      branchId: order.branch_id,
      userId: actorUserId,
      entityType: 'order',
      entityId: id,
      action: 'UPDATE_ITEMS',
      newValues: { itemCount: items.length },
    });

    return this.buildWithItems({ ...order, ...totalsToRow(totals) });
  }

  async updateStatus(
    businessId: string,
    id: string,
    newStatus: OrderStatus,
    actorUserId?: string,
    notes?: string,
  ): Promise<OrderWithItems> {
    const order = await this.getOwnedOrFail(businessId, id);
    if (!ALLOWED_TRANSITIONS[order.status].includes(newStatus)) {
      throw new InvalidOrderStatusTransitionException(order.status, newStatus);
    }

    const updated = await this.transactionService.execute(async (client) => {
      if (newStatus === OrderStatus.CONFIRMED) {
        await this.consumeStock(order, client, actorUserId);
      }
      if (
        newStatus === OrderStatus.CANCELLED &&
        order.status !== OrderStatus.PENDING
      ) {
        await this.reverseStock(order, client, actorUserId);
      }

      const row = await this.ordersRepository.setStatus(
        id,
        businessId,
        newStatus,
        STATUS_TIMESTAMP_COLUMN[newStatus],
        client,
      );
      if (!row) {
        throw new EntityNotFoundException('Order', id);
      }
      await this.ordersRepository.addStatusHistory(
        id,
        order.status,
        newStatus,
        actorUserId,
        notes,
        client,
      );

      if (newStatus === OrderStatus.DELIVERED && order.customer_id) {
        const amountSpent = parseFloat(order.total_amount);
        await this.customersService.recordCompletedOrder(
          order.customer_id,
          amountSpent,
          client,
        );
        await this.loyaltyService.awardPointsForOrder(
          businessId,
          order.customer_id,
          amountSpent,
          client,
        );
      }

      return row;
    });

    await this.auditService.record({
      businessId,
      branchId: order.branch_id,
      userId: actorUserId,
      entityType: 'order',
      entityId: id,
      action: newStatus,
    });

    return this.buildWithItems(updated);
  }

  /** Used by PaymentsService after registering a payment, to sync the order's payment_status. */
  async syncPaymentStatus(
    id: string,
    paymentStatus: string,
    client?: DbClient,
  ): Promise<void> {
    await this.ordersRepository.updatePaymentStatus(id, paymentStatus, client);
  }

  /** Used by PaymentsService/KitchenService to validate ownership without building the full item list. */
  async getOwnedOrFail(businessId: string, id: string): Promise<OrderRow> {
    const row = await this.ordersRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Order', id);
    }
    return row;
  }

  private async consumeStock(
    order: OrderRow,
    client: DbClient,
    actorUserId?: string,
  ): Promise<void> {
    const items = await this.ordersRepository.findItems(order.id, client);
    for (const item of items) {
      if (!item.product_id) {
        continue;
      }
      const product = await this.productsService.getOwnedOrFail(
        order.business_id,
        item.product_id,
      );
      if (!product.track_inventory) {
        continue;
      }
      const recipe = await this.recipesService.findByProductOrNull(
        order.business_id,
        item.product_id,
      );
      if (!recipe) {
        continue;
      }
      const orderedQuantity = parseFloat(item.quantity);
      for (const recipeItem of recipe.items) {
        const consumeQuantity =
          (recipeItem.quantity / recipe.cost.yieldQuantity) * orderedQuantity;
        await this.movementsService.recordMovement(
          {
            businessId: order.business_id,
            branchId: order.branch_id,
            inventoryItemId: recipeItem.inventoryItemId,
            movementType: InventoryMovementType.SALE_CONSUMPTION,
            quantity: consumeQuantity,
            referenceType: 'order',
            referenceId: order.id,
            createdBy: actorUserId,
          },
          client,
        );
      }
    }
  }

  private async reverseStock(
    order: OrderRow,
    client: DbClient,
    actorUserId?: string,
  ): Promise<void> {
    const consumed = await this.movementsService.getMovementsByReference(
      'order',
      order.id,
      client,
    );
    for (const movement of consumed) {
      if (movement.movementType !== InventoryMovementType.SALE_CONSUMPTION) {
        continue;
      }
      await this.movementsService.recordMovement(
        {
          businessId: order.business_id,
          branchId: order.branch_id,
          locationId: movement.locationId ?? undefined,
          inventoryItemId: movement.inventoryItemId,
          movementType: InventoryMovementType.RETURN,
          quantity: movement.quantity,
          referenceType: 'order_cancellation',
          referenceId: order.id,
          createdBy: actorUserId,
        },
        client,
      );
    }
  }

  private async computeItems(
    businessId: string,
    items: OrderItemInput[],
  ): Promise<OrderItemComputed[]> {
    const computed: OrderItemComputed[] = [];
    for (const item of items) {
      const product = await this.productsService.getOwnedOrFail(
        businessId,
        item.productId,
      );
      const unitPrice = parseFloat(product.sale_price);
      const discountAmount = item.discountAmount ?? 0;
      const totalPrice = round2(unitPrice * item.quantity - discountAmount);
      if (totalPrice < 0) {
        throw new BusinessRuleException(
          `Discount cannot exceed the line total for product "${product.name}"`,
          'ORDER_ITEM_DISCOUNT_EXCEEDS_TOTAL',
        );
      }
      computed.push({
        ...item,
        productNameSnapshot: product.name,
        unitPrice,
        unitCostSnapshot: parseFloat(product.current_cost),
        totalPrice,
      });
    }
    return computed;
  }

  private computeTotals(
    items: OrderItemComputed[],
    discountAmount: number,
    deliveryFee: number,
    taxRate: number,
  ): {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    deliveryFee: number;
    totalAmount: number;
  } {
    const subtotal = round2(
      items.reduce((sum, item) => sum + item.totalPrice, 0),
    );
    const taxableBase = Math.max(subtotal - discountAmount, 0);
    const taxAmount = round2(taxableBase * taxRate);
    const totalAmount = round2(taxableBase + taxAmount + deliveryFee);
    return { subtotal, discountAmount, taxAmount, deliveryFee, totalAmount };
  }

  private async buildWithItems(row: OrderRow): Promise<OrderWithItems> {
    const itemRows = await this.ordersRepository.findItems(row.id);
    return {
      ...OrderMapper.toDomain(row),
      items: itemRows.map((itemRow) => OrderMapper.itemToDomain(itemRow)),
    };
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function totalsToRow(totals: {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
}): Partial<OrderRow> {
  return {
    subtotal: String(totals.subtotal),
    discount_amount: String(totals.discountAmount),
    tax_amount: String(totals.taxAmount),
    delivery_fee: String(totals.deliveryFee),
    total_amount: String(totals.totalAmount),
  };
}
