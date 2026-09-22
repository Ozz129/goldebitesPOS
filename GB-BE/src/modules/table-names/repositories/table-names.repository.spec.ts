import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { TableNamesRepository } from './table-names.repository';

/**
 * Integration test against the real test database (golden_bites_test).
 * Focuses on the UNIQUE(branch_id, table_number) upsert behavior — the
 * whole point of this table is "at most one name per table, set again to
 * rename it" — and on delete()'s scoping.
 */
describe('TableNamesRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: TableNamesRepository;
  let businessId: string;
  let branchId: string;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: 'golden_bites_test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    db = new DatabaseService(pool);
    repository = new TableNamesRepository(db);

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
  });

  afterAll(async () => {
    await pool.query('DELETE FROM table_names WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM branches WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('upsert() creates on first call and renames in place on a second call for the same table', async () => {
    const created = await repository.upsert({
      businessId,
      branchId,
      tableNumber: '1',
      name: 'Mesa 1',
    });
    expect(created.name).toBe('Mesa 1');

    const renamed = await repository.upsert({
      businessId,
      branchId,
      tableNumber: '1',
      name: 'Terraza',
    });
    expect(renamed.id).toBe(created.id);
    expect(renamed.name).toBe('Terraza');

    const all = await repository.findAllByBranch(businessId, branchId);
    expect(all.filter((row) => row.table_number === '1')).toHaveLength(1);
  });

  it('findOne() returns null for a table with no custom name', async () => {
    expect(await repository.findOne(businessId, branchId, 'no-such-table')).toBeNull();
  });

  it('delete() removes the row and returns false on a second attempt', async () => {
    await repository.upsert({ businessId, branchId, tableNumber: '2', name: 'Salón' });

    expect(await repository.delete(businessId, branchId, '2')).toBe(true);
    expect(await repository.findOne(businessId, branchId, '2')).toBeNull();
    expect(await repository.delete(businessId, branchId, '2')).toBe(false);
  });

  it('findAllByBranch() only returns rows scoped to that business/branch', async () => {
    const otherBusiness = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Other Business ${randomUUID()}`],
    );
    const otherBranch = await pool.query<{ id: string }>(
      `INSERT INTO branches (business_id, name) VALUES ($1, $2) RETURNING id`,
      [otherBusiness.rows[0].id, `Other Branch ${randomUUID()}`],
    );
    await repository.upsert({
      businessId: otherBusiness.rows[0].id,
      branchId: otherBranch.rows[0].id,
      tableNumber: '1',
      name: 'No debería aparecer',
    });

    const names = await repository.findAllByBranch(businessId, branchId);
    expect(names.some((row) => row.name === 'No debería aparecer')).toBe(false);

    await pool.query('DELETE FROM table_names WHERE business_id = $1', [otherBusiness.rows[0].id]);
    await pool.query('DELETE FROM branches WHERE business_id = $1', [otherBusiness.rows[0].id]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [otherBusiness.rows[0].id]);
  });
});
