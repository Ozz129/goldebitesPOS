import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { InventoryQueryField, InventoryQueryIntent, InventoryQueryOperator } from '../domain/inventory-query.types';
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

    const created = await repository.create(
      { businessId, name: 'Bajo stock bebidas', conditions, intent: InventoryQueryIntent.DETAIL },
      undefined,
    );
    expect(created.conditions).toEqual(conditions);
    expect(created.intent).toBe(InventoryQueryIntent.DETAIL);

    const fetched = await repository.findById(created.id, businessId);
    expect(fetched?.conditions).toEqual(conditions);
  });

  it('persists the intent column', async () => {
    const created = await repository.create(
      {
        businessId,
        name: 'Conteo bebidas',
        conditions: [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS, value: 'a' }],
        intent: InventoryQueryIntent.COUNT,
      },
      undefined,
    );
    expect(created.intent).toBe(InventoryQueryIntent.COUNT);

    const fetched = await repository.findById(created.id, businessId);
    expect(fetched?.intent).toBe(InventoryQueryIntent.COUNT);
  });

  it('findAll() only returns templates for the given business, ordered by name', async () => {
    await repository.create({ businessId, name: 'Z template', conditions: [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS, value: 'a' }], intent: InventoryQueryIntent.DETAIL }, undefined);
    await repository.create({ businessId, name: 'A template', conditions: [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS, value: 'b' }], intent: InventoryQueryIntent.DETAIL }, undefined);

    const rows = await repository.findAll(businessId);
    const names = rows.map((r) => r.name);
    expect(names.indexOf('A template')).toBeLessThan(names.indexOf('Z template'));
  });

  it('delete() removes the template and returns false for an already-deleted id', async () => {
    const created = await repository.create(
      { businessId, name: 'To delete', conditions: [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS, value: 'x' }], intent: InventoryQueryIntent.DETAIL },
      undefined,
    );

    expect(await repository.delete(created.id, businessId)).toBe(true);
    expect(await repository.delete(created.id, businessId)).toBe(false);
    expect(await repository.findById(created.id, businessId)).toBeNull();
  });
});
