import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { BankTransferRequestsRepository } from './bank-transfer-requests.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('BankTransferRequestsRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: BankTransferRequestsRepository;
  let businessId: string;
  let branchId: string;
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
    repository = new BankTransferRequestsRepository(db);

    const suffix = randomUUID();
    const business = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${suffix}`],
    );
    businessId = business.rows[0].id;

    const branch = await pool.query<{ id: string }>(
      `INSERT INTO branches (business_id, name) VALUES ($1, $2) RETURNING id`,
      [businessId, `Test Branch ${suffix}`],
    );
    branchId = branch.rows[0].id;

    const order = await pool.query<{ id: string }>(
      `INSERT INTO orders (business_id, branch_id, order_type, order_number) VALUES ($1, $2, 'DINE_IN', 'TEST-1') RETURNING id`,
      [businessId, branchId],
    );
    orderId = order.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM bank_transfer_requests WHERE business_id = $1', [businessId]);
    await pool.query(`DELETE FROM bank_transactions WHERE external_id LIKE 'test-claim-request-%'`);
    await pool.query('DELETE FROM orders WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM branches WHERE id = $1', [branchId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('only one WAITING request can exist per order at a time (partial unique index)', async () => {
    await repository.create({ businessId, orderId, amountExpected: 10000 }, undefined);

    await expect(
      repository.create({ businessId, orderId, amountExpected: 10000 }, undefined),
    ).rejects.toThrow();
  });

  it('a new WAITING request is allowed again once the previous one is cancelled', async () => {
    const suffixOrder = await pool.query<{ id: string }>(
      `INSERT INTO orders (business_id, branch_id, order_type, order_number) VALUES ($1, $2, 'DINE_IN', 'TEST-2') RETURNING id`,
      [businessId, branchId],
    );
    const freshOrderId = suffixOrder.rows[0].id;

    const first = await repository.create({ businessId, orderId: freshOrderId, amountExpected: 5000 }, undefined);
    await repository.cancel(first.id);

    const second = await repository.create({ businessId, orderId: freshOrderId, amountExpected: 5000 }, undefined);
    expect(second.status).toBe('WAITING');
  });

  it('claim only succeeds once for the same request (no double confirmation)', async () => {
    const suffixOrder = await pool.query<{ id: string }>(
      `INSERT INTO orders (business_id, branch_id, order_type, order_number) VALUES ($1, $2, 'DINE_IN', 'TEST-3') RETURNING id`,
      [businessId, branchId],
    );
    const freshOrderId = suffixOrder.rows[0].id;
    const request = await repository.create({ businessId, orderId: freshOrderId, amountExpected: 7000 }, undefined);

    const transaction = await pool.query<{ id: string }>(
      `INSERT INTO bank_transactions (source, external_id, amount, received_at)
       VALUES ('MOCK', $1, 7000, now()) RETURNING id`,
      [`test-claim-request-${randomUUID()}`],
    );
    const transactionId = transaction.rows[0].id;

    const firstClaim = await repository.claim(request.id, transactionId, undefined);
    const secondClaim = await repository.claim(request.id, transactionId, undefined);

    expect(firstClaim?.status).toBe('MATCHED');
    expect(secondClaim).toBeNull();
  });
});
