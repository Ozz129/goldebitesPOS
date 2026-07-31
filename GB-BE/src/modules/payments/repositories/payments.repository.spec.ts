import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';
import { PaymentsRepository } from './payments.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('PaymentsRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: PaymentsRepository;
  let businessId: string;
  let orderId: string;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: 'golden_bites_test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    db = new DatabaseService(pool);
    repository = new PaymentsRepository(db);

    const business = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = business.rows[0].id;

    const branch = await pool.query<{ id: string }>(
      `INSERT INTO branches (business_id, name) VALUES ($1, $2) RETURNING id`,
      [businessId, `Test Branch ${randomUUID()}`],
    );

    const order = await pool.query<{ id: string }>(
      `INSERT INTO orders (business_id, branch_id, order_type) VALUES ($1, $2, 'DINE_IN') RETURNING id`,
      [businessId, branch.rows[0].id],
    );
    orderId = order.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM payments WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
    await pool.query('DELETE FROM branches WHERE business_id = $1', [
      businessId,
    ]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('getTotalPaid() sums every payment recorded for the order', async () => {
    await repository.create(
      { orderId, paymentMethod: PaymentMethod.CASH, amount: 10000 },
      undefined,
    );
    await repository.create(
      { orderId, paymentMethod: PaymentMethod.CARD, amount: 2500.5 },
      undefined,
    );

    const total = await repository.getTotalPaid(orderId);
    expect(total).toBe(12500.5);
  });

  it('getTotalPaid() returns 0 for an order with no payments', async () => {
    const order = await pool.query<{ id: string }>(
      `INSERT INTO orders (business_id, branch_id, order_type)
       SELECT business_id, branch_id, 'DINE_IN' FROM orders WHERE id = $1
       RETURNING id`,
      [orderId],
    );

    expect(await repository.getTotalPaid(order.rows[0].id)).toBe(0);

    await pool.query('DELETE FROM orders WHERE id = $1', [order.rows[0].id]);
  });

  it('findByOrder() lists payments in creation order', async () => {
    const payments = await repository.findByOrder(orderId);
    expect(payments.length).toBeGreaterThanOrEqual(2);
    expect(payments[0].payment_method).toBe(PaymentMethod.CASH);
  });
});
