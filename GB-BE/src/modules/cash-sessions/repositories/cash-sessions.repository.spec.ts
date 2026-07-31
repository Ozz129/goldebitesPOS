import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import {
  CashMovementType,
  PaymentMethod,
} from '../domain/cash-session.interface';
import { CashSessionsRepository } from './cash-sessions.repository';

/**
 * Integration test against the real test database (golden_bites_test).
 * getExpectedClosingAmount() is the highest-risk query in this module: it
 * mixes CASE WHEN branches over movement_type/payment_method literals with
 * a numeric SUM, and must be verified against real Postgres numeric
 * behavior rather than mocks.
 */
describe('CashSessionsRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: CashSessionsRepository;
  let businessId: string;
  let branchId: string;
  let userId: string;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: 'golden_bites_test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    db = new DatabaseService(pool);
    repository = new CashSessionsRepository(db);

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

    const role = await pool.query<{ id: string }>(
      `INSERT INTO roles (business_id, name) VALUES ($1, 'CASHIER') RETURNING id`,
      [businessId],
    );
    const user = await pool.query<{ id: string }>(
      `INSERT INTO users (business_id, branch_id, role_id, first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, 'Test', 'Cashier', $4, 'hash')
       RETURNING id`,
      [
        businessId,
        branchId,
        role.rows[0].id,
        `cashier.${randomUUID()}@example.com`,
      ],
    );
    userId = user.rows[0].id;
  });

  afterAll(async () => {
    await pool.query(
      'DELETE FROM cash_movements WHERE cash_session_id IN (SELECT id FROM cash_sessions WHERE business_id = $1)',
      [businessId],
    );
    await pool.query('DELETE FROM cash_sessions WHERE business_id = $1', [
      businessId,
    ]);
    await pool.query('DELETE FROM users WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM roles WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM branches WHERE id = $1', [branchId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('findOpenForBranch() only returns a session with status OPEN', async () => {
    const created = await repository.create(
      { businessId, branchId, openingAmount: 100 },
      userId,
    );

    const open = await repository.findOpenForBranch(businessId, branchId);
    expect(open?.id).toBe(created.id);
  });

  it('getExpectedClosingAmount() only counts cash sales, income, and subtracts expenses/withdrawals', async () => {
    const session = await repository.create(
      { businessId, branchId, openingAmount: 50000 },
      userId,
    );

    await repository.addMovement({
      cashSessionId: session.id,
      movementType: CashMovementType.SALE,
      paymentMethod: PaymentMethod.CASH,
      amount: 10000,
    });
    await repository.addMovement({
      cashSessionId: session.id,
      movementType: CashMovementType.SALE,
      paymentMethod: PaymentMethod.CARD,
      amount: 99999,
    });
    await repository.addMovement({
      cashSessionId: session.id,
      movementType: CashMovementType.INCOME,
      amount: 2000,
    });
    await repository.addMovement({
      cashSessionId: session.id,
      movementType: CashMovementType.EXPENSE,
      amount: 3000,
    });
    await repository.addMovement({
      cashSessionId: session.id,
      movementType: CashMovementType.WITHDRAWAL,
      amount: 1000,
    });

    const expected = await repository.getExpectedClosingAmount(session.id);
    expect(expected).toBe(58000);
  });

  it('close() only succeeds while the session is OPEN', async () => {
    const session = await repository.create(
      { businessId, branchId, openingAmount: 1000 },
      userId,
    );

    const closed = await repository.close(
      session.id,
      businessId,
      undefined,
      1000,
      1000,
      0,
      undefined,
    );
    expect(closed?.status).toBe('CLOSED');

    const secondAttempt = await repository.close(
      session.id,
      businessId,
      undefined,
      1000,
      1000,
      0,
      undefined,
    );
    expect(secondAttempt).toBeNull();
  });
});
