import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { InventoryLocationsRepository } from './inventory-locations.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('InventoryLocationsRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: InventoryLocationsRepository;
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
    repository = new InventoryLocationsRepository(db);

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
    await pool.query('DELETE FROM inventory_locations WHERE branch_id = $1', [
      branchId,
    ]);
    await pool.query('DELETE FROM branches WHERE id = $1', [branchId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('creates a location scoped to the branch', async () => {
    const location = await repository.create({
      branchId,
      name: 'Main Storage',
    });

    expect(location.branch_id).toBe(branchId);
    expect(location.is_active).toBe(true);
  });

  it('existsByName() detects duplicates and excludes the current row', async () => {
    const location = await repository.create({
      branchId,
      name: 'Cold Room',
    });

    expect(await repository.existsByName(branchId, 'Cold Room')).toBe(true);
    expect(
      await repository.existsByName(branchId, 'Cold Room', location.id),
    ).toBe(false);
  });

  it('setActive() toggles the flag', async () => {
    const location = await repository.create({
      branchId,
      name: 'Dry Storage',
    });

    const deactivated = await repository.setActive(
      location.id,
      branchId,
      false,
    );
    expect(deactivated?.is_active).toBe(false);
  });

  it('update() applies partial changes via COALESCE', async () => {
    const location = await repository.create({
      branchId,
      name: 'Freezer A',
    });

    const updated = await repository.update(location.id, branchId, {
      description: 'Walk-in freezer',
    });
    expect(updated?.name).toBe('Freezer A');
    expect(updated?.description).toBe('Walk-in freezer');
  });

  it('findAll() paginates and is scoped by branch', async () => {
    const otherBranch = await pool.query<{ id: string }>(
      `INSERT INTO branches (business_id, name) VALUES ($1, $2) RETURNING id`,
      [businessId, `Other Branch ${randomUUID()}`],
    );
    await repository.create({
      branchId: otherBranch.rows[0].id,
      name: 'Should not appear',
    });

    const { rows } = await repository.findAll({
      branchId,
      page: 1,
      limit: 50,
    });
    expect(rows.every((row) => row.branch_id === branchId)).toBe(true);

    await pool.query('DELETE FROM inventory_locations WHERE branch_id = $1', [
      otherBranch.rows[0].id,
    ]);
    await pool.query('DELETE FROM branches WHERE id = $1', [
      otherBranch.rows[0].id,
    ]);
  });
});
