import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { OrderStatus, OrderType } from '../domain/order.interface';
import { OrdersRepository } from './orders.repository';

/**
 * Integration test against the real test database (golden_bites_test).
 * setStatus() is a regression test for the dynamic timestamp-column SQL:
 * the column name is interpolated (never a bind parameter) from a fixed
 * internal map in OrdersService, and must only touch the one column for
 * the target status, leaving the others untouched.
 */
describe('OrdersRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: OrdersRepository;
  let businessId: string;
  let branchId: string;
  let productId: string;
  let waiterId: string;
  let otherWaiterId: string;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: 'golden_bites_test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    db = new DatabaseService(pool);
    repository = new OrdersRepository(db);

    const business = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = business.rows[0].id;

    const branch = await pool.query<{ id: string }>(
      `INSERT INTO branches (business_id, name) VALUES ($1, $2) RETURNING id`,
      [businessId, `Test Branch ${randomUUID()}`],
    );
    branchId = branch.rows[0].id;

    const product = await pool.query<{ id: string }>(
      `INSERT INTO products (business_id, name, sale_price) VALUES ($1, 'Burger', 25000) RETURNING id`,
      [businessId],
    );
    productId = product.rows[0].id;

    const role = await pool.query<{ id: string }>(
      `INSERT INTO roles (business_id, name) VALUES ($1, 'WAITER') RETURNING id`,
      [businessId],
    );
    const waiter = await pool.query<{ id: string }>(
      `INSERT INTO users (business_id, branch_id, role_id, first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, 'Test', 'Waiter', $4, 'hash')
       RETURNING id`,
      [
        businessId,
        branchId,
        role.rows[0].id,
        `waiter.${randomUUID()}@example.com`,
      ],
    );
    waiterId = waiter.rows[0].id;
    const otherWaiter = await pool.query<{ id: string }>(
      `INSERT INTO users (business_id, branch_id, role_id, first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, 'Test', 'OtherWaiter', $4, 'hash')
       RETURNING id`,
      [
        businessId,
        branchId,
        role.rows[0].id,
        `waiter2.${randomUUID()}@example.com`,
      ],
    );
    otherWaiterId = otherWaiter.rows[0].id;
  });

  afterAll(async () => {
    await pool.query(
      'DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE business_id = $1)',
      [businessId],
    );
    await pool.query(
      'DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE business_id = $1)',
      [businessId],
    );
    await pool.query('DELETE FROM orders WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM products WHERE business_id = $1', [
      businessId,
    ]);
    await pool.query('DELETE FROM users WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM roles WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM branches WHERE id = $1', [branchId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('create() assigns a sequential order_number and defaults to PENDING', async () => {
    const order = await repository.create(
      { businessId, branchId, orderType: OrderType.DINE_IN },
      undefined,
    );

    expect(order.status).toBe(OrderStatus.PENDING);
    expect(Number(order.order_number)).toBeGreaterThan(0);
  });

  it('addItems() + findItems() persist decimal quantities correctly', async () => {
    const order = await repository.create(
      { businessId, branchId, orderType: OrderType.TAKEAWAY },
      undefined,
    );

    await repository.addItems(order.id, [
      {
        productId,
        quantity: 2.5,
        productNameSnapshot: 'Burger',
        unitPrice: 25000,
        unitCostSnapshot: 8000,
        totalPrice: 62500,
      },
    ]);

    const items = await repository.findItems(order.id);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe('2.500');
    expect(items[0].total_price).toBe('62500.00');
  });

  it('replaceItems() fully replaces the previous set', async () => {
    const order = await repository.create(
      { businessId, branchId, orderType: OrderType.TAKEAWAY },
      undefined,
    );
    await repository.addItems(order.id, [
      {
        productId,
        quantity: 1,
        productNameSnapshot: 'Burger',
        unitPrice: 25000,
        unitCostSnapshot: 8000,
        totalPrice: 25000,
      },
    ]);

    await repository.replaceItems(order.id, [
      {
        productId,
        quantity: 3,
        productNameSnapshot: 'Burger',
        unitPrice: 25000,
        unitCostSnapshot: 8000,
        totalPrice: 75000,
      },
    ]);

    const items = await repository.findItems(order.id);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe('3.000');
  });

  it('setStatus() only stamps the timestamp column mapped to the target status', async () => {
    const order = await repository.create(
      { businessId, branchId, orderType: OrderType.DINE_IN },
      undefined,
    );

    const confirmed = await repository.setStatus(
      order.id,
      businessId,
      OrderStatus.CONFIRMED,
      'confirmed_at',
    );
    expect(confirmed?.confirmed_at).not.toBeNull();
    expect(confirmed?.prepared_at).toBeNull();

    const preparing = await repository.setStatus(
      order.id,
      businessId,
      OrderStatus.PREPARING,
      null,
    );
    expect(preparing?.prepared_at).toBeNull();

    const ready = await repository.setStatus(
      order.id,
      businessId,
      OrderStatus.READY,
      'prepared_at',
    );
    expect(ready?.prepared_at).not.toBeNull();
    expect(ready?.delivered_at).toBeNull();
  });

  it('findActiveForKitchen() only returns CONFIRMED/PREPARING orders for the branch', async () => {
    const pending = await repository.create(
      { businessId, branchId, orderType: OrderType.DINE_IN },
      undefined,
    );
    const confirmed = await repository.create(
      { businessId, branchId, orderType: OrderType.DINE_IN },
      undefined,
    );
    await repository.setStatus(
      confirmed.id,
      businessId,
      OrderStatus.CONFIRMED,
      'confirmed_at',
    );

    const queue = await repository.findActiveForKitchen(businessId, branchId);
    const ids = queue.map((row) => row.id);

    expect(ids).toContain(confirmed.id);
    expect(ids).not.toContain(pending.id);
  });

  it('findAll() filters by createdBy', async () => {
    const own = await repository.create(
      { businessId, branchId, orderType: OrderType.DINE_IN },
      waiterId,
    );
    await repository.create(
      { businessId, branchId, orderType: OrderType.DINE_IN },
      otherWaiterId,
    );

    const { rows } = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      createdBy: waiterId,
    });
    const ids = rows.map((row) => row.id);

    expect(ids).toContain(own.id);
    expect(ids).toHaveLength(1);
  });

  it('addStatusHistory() + findStatusHistory() record the transition trail', async () => {
    const order = await repository.create(
      { businessId, branchId, orderType: OrderType.DINE_IN },
      undefined,
    );
    await repository.addStatusHistory(
      order.id,
      null,
      OrderStatus.PENDING,
      undefined,
      undefined,
    );
    await repository.addStatusHistory(
      order.id,
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      undefined,
      'looks good',
    );

    const history = await repository.findStatusHistory(order.id);
    expect(history).toHaveLength(2);
    expect(history[1].new_status).toBe(OrderStatus.CONFIRMED);
    expect(history[1].notes).toBe('looks good');
  });

  describe('reporting aggregates', () => {
    async function createDeliveredOrder(
      quantity: number,
      unitPrice: number,
    ): Promise<string> {
      const order = await repository.create(
        { businessId, branchId, orderType: OrderType.TAKEAWAY },
        undefined,
      );
      await repository.addItems(order.id, [
        {
          productId,
          quantity,
          productNameSnapshot: 'Burger',
          unitPrice,
          unitCostSnapshot: 8000,
          totalPrice: quantity * unitPrice,
        },
      ]);
      await repository.updateTotals(
        order.id,
        quantity * unitPrice,
        0,
        0,
        0,
        quantity * unitPrice,
      );
      await repository.setStatus(
        order.id,
        businessId,
        OrderStatus.DELIVERED,
        'delivered_at',
      );
      return order.id;
    }

    it('getActiveCount() only counts orders still in the pipeline', async () => {
      await repository.create(
        { businessId, branchId, orderType: OrderType.DINE_IN },
        undefined,
      );
      await createDeliveredOrder(1, 1000);

      const active = await repository.getActiveCount(businessId, branchId);
      expect(active).toBeGreaterThanOrEqual(1);
    });

    it('getSalesSummary() sums only DELIVERED orders within the date range', async () => {
      await createDeliveredOrder(2, 5000);

      const now = new Date();
      const dateFrom = new Date(now.getTime() - 60000).toISOString();
      const dateTo = new Date(now.getTime() + 60000).toISOString();

      const summary = await repository.getSalesSummary(
        businessId,
        branchId,
        dateFrom,
        dateTo,
      );
      expect(parseInt(summary.order_count, 10)).toBeGreaterThanOrEqual(1);
      expect(parseFloat(summary.total_amount ?? '0')).toBeGreaterThanOrEqual(
        10000,
      );
    });

    it('getSalesByDay() groups totals by calendar day', async () => {
      await createDeliveredOrder(1, 3000);

      const now = new Date();
      const dateFrom = new Date(now.getTime() - 60000).toISOString();
      const dateTo = new Date(now.getTime() + 60000).toISOString();

      const days = await repository.getSalesByDay(
        businessId,
        branchId,
        dateFrom,
        dateTo,
      );
      expect(days.length).toBeGreaterThanOrEqual(1);
      const today = now.toISOString().slice(0, 10);
      expect(days.some((day) => day.date === today)).toBe(true);
    });

    it('getTopProducts() aggregates quantity and revenue per product', async () => {
      await createDeliveredOrder(4, 2500);

      const now = new Date();
      const dateFrom = new Date(now.getTime() - 60000).toISOString();
      const dateTo = new Date(now.getTime() + 60000).toISOString();

      const top = await repository.getTopProducts(
        businessId,
        branchId,
        dateFrom,
        dateTo,
        10,
      );
      const entry = top.find((row) => row.product_id === productId);
      expect(entry).toBeDefined();
      expect(parseFloat(entry?.quantity_sold ?? '0')).toBeGreaterThanOrEqual(4);
    });
  });
});
