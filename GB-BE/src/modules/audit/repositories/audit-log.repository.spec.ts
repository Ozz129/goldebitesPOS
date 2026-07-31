import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { AuditLogRepository } from './audit-log.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('AuditLogRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: AuditLogRepository;
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
    repository = new AuditLogRepository(db);

    const business = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = business.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM audit_logs WHERE business_id = $1', [
      businessId,
    ]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('insert() + findAll() round-trips JSONB old/new values', async () => {
    await repository.insert({
      businessId,
      entityType: 'order',
      entityId: randomUUID(),
      action: 'CREATE',
      newValues: { totalAmount: 1000 },
    });

    const { rows, total } = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      entityType: 'order',
    });
    expect(total).toBe(1);
    expect(rows[0].new_values).toEqual({ totalAmount: 1000 });
  });

  it('findAll() filters by action', async () => {
    await repository.insert({
      businessId,
      entityType: 'business',
      action: 'UPDATE_TAX_RATE',
    });

    const { rows } = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      action: 'UPDATE_TAX_RATE',
    });
    expect(rows.every((row) => row.action === 'UPDATE_TAX_RATE')).toBe(true);
  });
});
