import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { SuppliersRepository } from './suppliers.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('SuppliersRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: SuppliersRepository;
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
    repository = new SuppliersRepository(db);

    const result = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM suppliers WHERE business_id = $1', [
      businessId,
    ]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('creates a supplier with contact details', async () => {
    const created = await repository.create({
      businessId,
      name: 'Acme Foods',
      taxId: '900123456-7',
      contactName: 'Jane Doe',
      email: 'jane@acme.test',
    });

    expect(created.name).toBe('Acme Foods');
    expect(created.contact_name).toBe('Jane Doe');
    expect(created.is_active).toBe(true);
  });

  it('does not enforce name uniqueness (schema allows duplicate supplier names)', async () => {
    await repository.create({ businessId, name: 'Duplicate Co' });
    const second = await repository.create({
      businessId,
      name: 'Duplicate Co',
    });

    expect(second.name).toBe('Duplicate Co');
  });

  it('findAll() filters by isActive and searches name/tax_id/contact_name', async () => {
    const supplier = await repository.create({
      businessId,
      name: 'Searchable Supplier',
      taxId: 'TAX-999',
    });
    await repository.setActive(supplier.id, businessId, false);

    const activeOnly = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      isActive: true,
    });
    expect(activeOnly.rows.some((row) => row.id === supplier.id)).toBe(false);

    const bySearch = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      search: 'TAX-999',
    });
    expect(bySearch.rows.some((row) => row.id === supplier.id)).toBe(true);
  });

  it('update() applies partial changes without clobbering other fields', async () => {
    const created = await repository.create({
      businessId,
      name: 'Partial Co',
      phone: '555-1234',
    });

    const updated = await repository.update(created.id, businessId, {
      email: 'new@partial.test',
    });
    expect(updated?.email).toBe('new@partial.test');
    expect(updated?.phone).toBe('555-1234');
  });

  it('findById() returns null for a supplier owned by another business', async () => {
    const created = await repository.create({
      businessId,
      name: 'Isolated Co',
    });

    expect(await repository.findById(created.id, randomUUID())).toBeNull();
  });
});
