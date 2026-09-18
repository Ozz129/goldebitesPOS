import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { InventoryQueryField, InventoryQueryOperator } from '../domain/inventory-query.types';
import { InventoryQueryTemplatesRepository } from './inventory-query-templates.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('InventoryQueryTemplatesRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: InventoryQueryTemplatesRepository;
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
    repository = new InventoryQueryTemplatesRepository(db);

    const business = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = business.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM inventory_query_templates WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('round-trips the conditions array through JSONB intact', async () => {
    const conditions = [
      { field: InventoryQueryField.CATEGORY_ID, operator: InventoryQueryOperator.EQUALS, value: 'cat-1' },
      { field: InventoryQueryField.CURRENT_STOCK, operator: InventoryQueryOperator.LESS_THAN, value: 10 },
    ];

    const created = await repository.create({ businessId, name: 'Bajo stock bebidas', conditions }, undefined);
    expect(created.conditions).toEqual(conditions);

    const fetched = await repository.findById(created.id, businessId);
    expect(fetched?.conditions).toEqual(conditions);
  });

  it('findAll() only returns templates for the given business, ordered by name', async () => {
    await repository.create({ businessId, name: 'Z template', conditions: [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS, value: 'a' }] }, undefined);
    await repository.create({ businessId, name: 'A template', conditions: [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS, value: 'b' }] }, undefined);

    const rows = await repository.findAll(businessId);
    const names = rows.map((r) => r.name);
    expect(names.indexOf('A template')).toBeLessThan(names.indexOf('Z template'));
  });

  it('delete() removes the template and returns false for an already-deleted id', async () => {
    const created = await repository.create(
      { businessId, name: 'To delete', conditions: [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS, value: 'x' }] },
      undefined,
    );

    expect(await repository.delete(created.id, businessId)).toBe(true);
    expect(await repository.delete(created.id, businessId)).toBe(false);
    expect(await repository.findById(created.id, businessId)).toBeNull();
  });
});
