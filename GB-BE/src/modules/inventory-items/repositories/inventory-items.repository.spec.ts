import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { InventoryItemsRepository } from './inventory-items.repository';

/**
 * Integration test against the real test database (golden_bites_test).
 * Also serves as a regression test for a real bug found in Phase 3: Postgres
 * infers untyped numeric literals in `COALESCE($n, 0)` as integer, which
 * rejected decimal values like 0.8 until the params were cast to ::numeric.
 */
describe('InventoryItemsRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: InventoryItemsRepository;
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
    repository = new InventoryItemsRepository(db);

    const result = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM inventory_items WHERE business_id = $1', [
      businessId,
    ]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('creates an item with decimal minimumStock/currentCost without a type error', async () => {
    const created = await repository.create({
      businessId,
      name: 'Flour',
      unit: 'kg',
      minimumStock: 10.5,
      currentCost: 2.75,
    });

    expect(created.minimum_stock).toBe('10.500');
    expect(created.current_cost).toBe('2.75');
  });

  it('defaults minimumStock/currentCost to 0 when omitted (also decimal-safe)', async () => {
    const created = await repository.create({
      businessId,
      name: 'Salt',
      unit: 'kg',
    });

    expect(created.minimum_stock).toBe('0.000');
    expect(created.current_cost).toBe('0.00');
  });

  it('existsBySku() detects duplicates and excludes the current row', async () => {
    const item = await repository.create({
      businessId,
      name: 'Sugar',
      unit: 'kg',
      sku: 'SUG-1',
    });

    expect(await repository.existsBySku(businessId, 'SUG-1')).toBe(true);
    expect(await repository.existsBySku(businessId, 'SUG-1', item.id)).toBe(
      false,
    );
  });

  it('softDelete() hides the item from findById/findAll', async () => {
    const item = await repository.create({
      businessId,
      name: 'Butter',
      unit: 'kg',
    });

    const deleted = await repository.softDelete(item.id, businessId);
    expect(deleted?.deleted_at).not.toBeNull();

    expect(await repository.findById(item.id, businessId)).toBeNull();

    const { rows } = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
    });
    expect(rows.some((row) => row.id === item.id)).toBe(false);
  });

  it('update() applies partial changes with decimal values', async () => {
    const item = await repository.create({
      businessId,
      name: 'Oil',
      unit: 'l',
    });

    const updated = await repository.update(item.id, businessId, {
      currentCost: 6.99,
    });
    expect(updated?.current_cost).toBe('6.99');
    expect(updated?.name).toBe('Oil');
  });
});
