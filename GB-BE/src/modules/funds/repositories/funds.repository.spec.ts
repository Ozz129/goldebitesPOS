import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { TransactionService } from '../../../database/transaction.service';
import { FundType, FundMovementDirection } from '../domain/fund.types';
import { FundsRepository } from './funds.repository';

/**
 * Integration test against the real test database (golden_bites_test).
 * Focuses on the DB-level guarantees the service relies on: the
 * NULLS-NOT-DISTINCT uniqueness of one fund per (business, branch, type),
 * the non-negative balance CHECK, and the idempotency unique index — all of
 * these are the actual safety net, not just the service-layer logic.
 */
describe('FundsRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let transactionService: TransactionService;
  let repository: FundsRepository;
  let businessId: string;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: 'golden_bites_test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    db = new DatabaseService(pool);
    transactionService = new TransactionService(pool);
    repository = new FundsRepository(db);

    const business = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = business.rows[0].id;
  });

  afterAll(async () => {
    await pool.query(
      'DELETE FROM fund_movements WHERE fund_id IN (SELECT id FROM funds WHERE business_id = $1)',
      [businessId],
    );
    await pool.query('DELETE FROM funds WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM users WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM roles WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('getOrCreateFundForUpdate() creates the fund once and reuses it on later calls', async () => {
    const first = await transactionService.execute((client) =>
      repository.getOrCreateFundForUpdate(businessId, null, FundType.BANK_ACCOUNT, client),
    );
    const second = await transactionService.execute((client) =>
      repository.getOrCreateFundForUpdate(businessId, null, FundType.BANK_ACCOUNT, client),
    );

    expect(second.id).toBe(first.id);
  });

  it('NULLS NOT DISTINCT: the DB itself rejects a second business-level fund of the same type', async () => {
    await transactionService.execute((client) =>
      repository.getOrCreateFundForUpdate(businessId, null, FundType.NEXT_OPENING_FUND, client),
    );

    await expect(
      pool.query(
        `INSERT INTO funds (business_id, branch_id, fund_type) VALUES ($1, NULL, $2)`,
        [businessId, FundType.NEXT_OPENING_FUND],
      ),
    ).rejects.toThrow();
  });

  it('rejects a movement that would leave a negative balance_after at the DB level', async () => {
    const fund = await transactionService.execute((client) =>
      repository.getOrCreateFundForUpdate(businessId, null, FundType.CASH_RESERVE, client),
    );

    await expect(
      pool.query(
        `INSERT INTO fund_movements (fund_id, direction, amount, balance_before, balance_after, source_type)
         VALUES ($1, $2, 100, 0, -100, 'TEST')`,
        [fund.id, FundMovementDirection.DEBIT],
      ),
    ).rejects.toThrow();
  });

  it('idempotency index rejects a second movement with the same (fund, source_type, source_id)', async () => {
    const fund = await transactionService.execute((client) =>
      repository.getOrCreateFundForUpdate(businessId, null, FundType.CASH_RESERVE, client),
    );
    const sourceId = randomUUID();

    await pool.query(
      `INSERT INTO fund_movements (fund_id, direction, amount, balance_before, balance_after, source_type, source_id)
       VALUES ($1, 'CREDIT', 100, 0, 100, 'EXPENSE', $2)`,
      [fund.id, sourceId],
    );

    await expect(
      pool.query(
        `INSERT INTO fund_movements (fund_id, direction, amount, balance_before, balance_after, source_type, source_id)
         VALUES ($1, 'CREDIT', 100, 100, 200, 'EXPENSE', $2)`,
        [fund.id, sourceId],
      ),
    ).rejects.toThrow();
  });

  it('AC-11: rolls back every write in the transaction when a later step fails', async () => {
    const sourceId = randomUUID();

    await expect(
      transactionService.execute(async (client) => {
        const fund = await repository.getOrCreateFundForUpdate(businessId, null, FundType.NEXT_OPENING_FUND, client);
        await repository.insertMovement(
          {
            fundId: fund.id,
            direction: FundMovementDirection.CREDIT,
            amount: 50,
            balanceBefore: 0,
            balanceAfter: 50,
            sourceType: 'TEST_ROLLBACK',
            sourceId,
          },
          client,
        );
        // A real write already happened in this transaction above — now force
        // a failure so we can prove the whole transaction, not just the last
        // statement, gets rolled back.
        throw new Error('forced failure after insert');
      }),
    ).rejects.toThrow('forced failure after insert');

    const movement = await pool.query(
      `SELECT 1 FROM fund_movements WHERE source_type = 'TEST_ROLLBACK' AND source_id = $1`,
      [sourceId],
    );
    expect(movement.rows).toHaveLength(0);
  });

  it('markInitialized() sets initialized_at/by/notes, and findFund() reflects it', async () => {
    const fund = await transactionService.execute((client) =>
      repository.getOrCreateFundForUpdate(businessId, null, FundType.BANK_ACCOUNT, client),
    );

    const user = await pool.query<{ id: string }>(
      `INSERT INTO roles (business_id, name) VALUES ($1, 'OWNER') RETURNING id`,
      [businessId],
    );
    const userRow = await pool.query<{ id: string }>(
      `INSERT INTO users (business_id, role_id, first_name, last_name, email, password_hash)
       VALUES ($1, $2, 'Test', 'Admin', $3, 'hash') RETURNING id`,
      [businessId, user.rows[0].id, `admin.${randomUUID()}@example.com`],
    );

    await transactionService.execute((client) =>
      repository.markInitialized(fund.id, userRow.rows[0].id, 'saldo inicial verificado', client),
    );

    const found = await repository.findFund(businessId, null, FundType.BANK_ACCOUNT);
    expect(found?.initialized_at).not.toBeNull();
    expect(found?.initialization_notes).toBe('saldo inicial verificado');
  });
});
