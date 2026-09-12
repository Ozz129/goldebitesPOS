import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { BankTransactionSource } from '../domain/bank-transaction.types';
import { BankTransactionsRepository } from './bank-transactions.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('BankTransactionsRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: BankTransactionsRepository;
  let externalIdSuffix: string;
  let businessId: string;
  let branchId: string;
  let orderAId: string;
  let orderBId: string;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: 'golden_bites_test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    db = new DatabaseService(pool);
    repository = new BankTransactionsRepository(db);
    externalIdSuffix = randomUUID();

    const business = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${externalIdSuffix}`],
    );
    businessId = business.rows[0].id;

    const branch = await pool.query<{ id: string }>(
      `INSERT INTO branches (business_id, name) VALUES ($1, $2) RETURNING id`,
      [businessId, `Test Branch ${externalIdSuffix}`],
    );
    branchId = branch.rows[0].id;

    const orderA = await pool.query<{ id: string }>(
      `INSERT INTO orders (business_id, branch_id, order_type, order_number) VALUES ($1, $2, 'DINE_IN', 'TEST-A') RETURNING id`,
      [businessId, branchId],
    );
    orderAId = orderA.rows[0].id;

    const orderB = await pool.query<{ id: string }>(
      `INSERT INTO orders (business_id, branch_id, order_type, order_number) VALUES ($1, $2, 'DINE_IN', 'TEST-B') RETURNING id`,
      [businessId, branchId],
    );
    orderBId = orderB.rows[0].id;
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM bank_transactions WHERE external_id LIKE $1`, [`test-%${externalIdSuffix}`]);
    await pool.query('DELETE FROM orders WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM branches WHERE id = $1', [branchId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('scenario 6: inserting the same (source, external_id) twice is idempotent', async () => {
    const externalId = `test-dup-${externalIdSuffix}`;
    const transaction = {
      externalId,
      amount: 15000,
      receivedAt: new Date(),
      reference: null,
      source: BankTransactionSource.MOCK,
      rawMetadata: {},
    };

    const first = await repository.insertIfNew(transaction);
    const second = await repository.insertIfNew(transaction);

    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });

  it('scenario 7: findCandidatesByAmountWindow excludes transactions outside the time window', async () => {
    const amount = 27700 + Math.floor(Math.random() * 1000);
    const insideWindow = new Date('2026-09-10T12:00:00Z');
    const outsideWindow = new Date('2026-09-10T18:00:00Z');

    await repository.insertIfNew({
      externalId: `test-inside-${externalIdSuffix}`,
      amount,
      receivedAt: insideWindow,
      reference: null,
      source: BankTransactionSource.MOCK,
      rawMetadata: {},
    });
    await repository.insertIfNew({
      externalId: `test-outside-${externalIdSuffix}`,
      amount,
      receivedAt: outsideWindow,
      reference: null,
      source: BankTransactionSource.MOCK,
      rawMetadata: {},
    });

    const candidates = await repository.findCandidatesByAmountWindow(
      amount,
      new Date('2026-09-10T11:00:00Z'),
      new Date('2026-09-10T13:00:00Z'),
    );

    expect(candidates).toHaveLength(1);
    expect(candidates[0].external_id).toBe(`test-inside-${externalIdSuffix}`);
  });

  it('claimForOrder only succeeds once for the same transaction (no double use)', async () => {
    const inserted = await repository.insertIfNew({
      externalId: `test-claim-${externalIdSuffix}`,
      amount: 9000,
      receivedAt: new Date(),
      reference: null,
      source: BankTransactionSource.MOCK,
      rawMetadata: {},
    });

    const firstClaim = await repository.claimForOrder(inserted!.id, orderAId);
    const secondClaim = await repository.claimForOrder(inserted!.id, orderBId);

    expect(firstClaim?.status).toBe('MATCHED');
    expect(secondClaim).toBeNull();
  });
});
