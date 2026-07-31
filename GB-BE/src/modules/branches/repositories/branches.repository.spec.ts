import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { BranchesRepository } from './branches.repository';

/**
 * Integration test against the real test database (golden_bites_test),
 * per the "no mocking repositories in integration tests" convention.
 * Requires DB_HOST/DB_USER/DB_PASSWORD/DB_PORT to be reachable — same
 * connection as the app, just pointed at the test database.
 */
describe('BranchesRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: BranchesRepository;
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
    repository = new BranchesRepository(db);

    const result = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM branches WHERE business_id = $1', [
      businessId,
    ]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('creates a branch and finds it scoped to its business', async () => {
    const created = await repository.create({
      businessId,
      name: 'Sede Test A',
    });

    expect(created.name).toBe('Sede Test A');
    expect(created.is_active).toBe(true);

    const found = await repository.findById(created.id, businessId);
    expect(found?.id).toBe(created.id);

    const notFoundForOtherBusiness = await repository.findById(
      created.id,
      randomUUID(),
    );
    expect(notFoundForOtherBusiness).toBeNull();
  });

  it('existsByName() detects duplicates and excludes the current row when updating', async () => {
    const branch = await repository.create({ businessId, name: 'Sede Test B' });

    expect(await repository.existsByName(businessId, 'Sede Test B')).toBe(true);
    expect(
      await repository.existsByName(businessId, 'Sede Test B', branch.id),
    ).toBe(false);
    expect(await repository.existsByName(businessId, 'Nonexistent Name')).toBe(
      false,
    );
  });

  it('findAll() filters by isActive and search, and paginates', async () => {
    await repository.create({
      businessId,
      name: 'Sede Filter Active',
      city: 'Bogota',
    });
    const inactive = await repository.create({
      businessId,
      name: 'Sede Filter Inactive',
    });
    await repository.setActive(inactive.id, businessId, false);

    const activeOnly = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      isActive: true,
    });
    expect(activeOnly.rows.every((row) => row.is_active)).toBe(true);
    expect(
      activeOnly.rows.some((row) => row.name === 'Sede Filter Inactive'),
    ).toBe(false);

    const bySearch = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      search: 'Filter Active',
    });
    expect(bySearch.rows.some((row) => row.name === 'Sede Filter Active')).toBe(
      true,
    );
    expect(bySearch.total).toBeGreaterThanOrEqual(1);
  });

  it('update() applies partial changes and setActive() toggles status', async () => {
    const branch = await repository.create({ businessId, name: 'Sede Test C' });

    const updated = await repository.update(branch.id, businessId, {
      city: 'Medellin',
    });
    expect(updated?.city).toBe('Medellin');
    expect(updated?.name).toBe('Sede Test C');

    const deactivated = await repository.setActive(
      branch.id,
      businessId,
      false,
    );
    expect(deactivated?.is_active).toBe(false);
  });

  it('returns null when updating a branch that does not belong to the business', async () => {
    const branch = await repository.create({ businessId, name: 'Sede Test D' });

    const result = await repository.update(branch.id, randomUUID(), {
      city: 'Cali',
    });
    expect(result).toBeNull();
  });
});
