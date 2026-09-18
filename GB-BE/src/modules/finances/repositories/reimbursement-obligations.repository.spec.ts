import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { ReimbursementObligationStatus } from '../domain/reimbursement.types';
import { ReimbursementObligationsRepository } from './reimbursement-obligations.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('ReimbursementObligationsRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: ReimbursementObligationsRepository;
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
    repository = new ReimbursementObligationsRepository(db);

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
      `INSERT INTO roles (business_id, name) VALUES ($1, 'OWNER') RETURNING id`,
      [businessId],
    );
    const user = await pool.query<{ id: string }>(
      `INSERT INTO users (business_id, branch_id, role_id, first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, 'Test', 'Admin', $4, 'hash')
       RETURNING id`,
      [businessId, branchId, role.rows[0].id, `admin.${randomUUID()}@example.com`],
    );
    userId = user.rows[0].id;
  });

  afterAll(async () => {
    await pool.query(
      'DELETE FROM reimbursement_payments WHERE obligation_id IN (SELECT id FROM reimbursement_obligations WHERE business_id = $1)',
      [businessId],
    );
    await pool.query('DELETE FROM reimbursement_obligations WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM expenses WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM users WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM roles WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM branches WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  async function createExpense(amount: number): Promise<string> {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO expenses (business_id, category, name, description, responsible, amount, expense_date, payment_source, payer_name)
       VALUES ($1, 'OPERATING', 'Test expense', 'Test', 'Ana', $2, CURRENT_DATE, 'PERSONAL_MONEY', 'Carlos')
       RETURNING id`,
      [businessId, amount],
    );
    return result.rows[0].id;
  }

  it('creates an obligation with reimbursed_amount computed as 0 (no payments yet)', async () => {
    const expenseId = await createExpense(100000);
    const created = await repository.create({
      businessId,
      expenseId,
      payerName: 'Carlos',
      originalAmount: 100000,
    });

    expect(created.reimbursed_amount).toBe('0');
    expect(created.status).toBe(ReimbursementObligationStatus.PENDING);

    const fetched = await repository.findById(created.id, businessId);
    expect(fetched?.reimbursed_amount).toBe('0');
  });

  it('reimbursed_amount reflects SUM(reimbursement_payments) — never a stored column', async () => {
    const expenseId = await createExpense(100000);
    const created = await repository.create({
      businessId,
      expenseId,
      payerName: 'Carlos',
      originalAmount: 100000,
    });

    // Insert two payments directly, bypassing the service layer, to prove the
    // balance is always derived from the ledger rather than a maintained column.
    await pool.query(
      `INSERT INTO reimbursement_payments (obligation_id, branch_id, amount) VALUES ($1, $2, 30000), ($1, $2, 20000)`,
      [created.id, branchId],
    );

    const fetched = await repository.findById(created.id, businessId);
    expect(parseFloat(fetched?.reimbursed_amount ?? '0')).toBe(50000);
  });

  it('findAll() filters by status', async () => {
    const expenseId = await createExpense(15000);
    const created = await repository.create({
      businessId,
      expenseId,
      payerName: 'Filtro status',
      originalAmount: 15000,
    });
    await repository.updateStatus(created.id, ReimbursementObligationStatus.REIMBURSED);

    const { rows } = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      status: ReimbursementObligationStatus.REIMBURSED,
    });
    expect(rows.some((r) => r.id === created.id)).toBe(true);
  });

  it('void() sets status/voided_at/voided_by/void_reason', async () => {
    const expenseId = await createExpense(20000);
    const created = await repository.create({
      businessId,
      expenseId,
      payerName: 'Se anula',
      originalAmount: 20000,
    });

    const voided = await repository.void(created.id, userId, 'no se va a cobrar');
    expect(voided?.status).toBe(ReimbursementObligationStatus.VOIDED);
    expect(voided?.void_reason).toBe('no se va a cobrar');
    expect(voided?.voided_by).toBe(userId);
  });

  it('getSummary() counts only PENDING/PARTIALLY_REIMBURSED and sums their pending balance', async () => {
    const expenseIdA = await createExpense(100000);
    const expenseIdB = await createExpense(50000);
    await repository.create({ businessId, expenseId: expenseIdA, payerName: 'A', originalAmount: 100000 });
    const obligationB = await repository.create({
      businessId,
      expenseId: expenseIdB,
      payerName: 'B',
      originalAmount: 50000,
    });
    await repository.updateStatus(obligationB.id, ReimbursementObligationStatus.REIMBURSED);

    const summary = await repository.getSummary(businessId);
    expect(summary.pendingCount).toBeGreaterThanOrEqual(1);
    expect(summary.pendingTotalAmount).toBeGreaterThanOrEqual(100000);
  });
});
