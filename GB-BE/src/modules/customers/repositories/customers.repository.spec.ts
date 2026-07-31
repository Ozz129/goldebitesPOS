import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { CustomersRepository } from './customers.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('CustomersRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: CustomersRepository;
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
    repository = new CustomersRepository(db);

    const business = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = business.rows[0].id;
  });

  afterAll(async () => {
    await pool.query(
      'DELETE FROM customer_addresses WHERE customer_id IN (SELECT id FROM customers WHERE business_id = $1)',
      [businessId],
    );
    await pool.query('DELETE FROM customers WHERE business_id = $1', [
      businessId,
    ]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('incrementStats() accumulates total_orders and total_spent', async () => {
    const customer = await repository.create({ businessId, firstName: 'Ana' });

    await repository.incrementStats(customer.id, 10000);
    await repository.incrementStats(customer.id, 5000.5);

    const updated = await repository.findById(customer.id, businessId);
    expect(updated?.total_orders).toBe(2);
    expect(updated?.total_spent).toBe('15000.50');
  });

  it('createAddress() with isDefault=true clears the previous default', async () => {
    const customer = await repository.create({ businessId, firstName: 'Beto' });

    const first = await repository.createAddress(customer.id, {
      address: 'Calle 1',
      isDefault: true,
    });
    const second = await repository.createAddress(customer.id, {
      address: 'Calle 2',
      isDefault: true,
    });

    const addresses = await repository.findAddresses(customer.id);
    const firstReloaded = addresses.find((address) => address.id === first.id);
    const secondReloaded = addresses.find(
      (address) => address.id === second.id,
    );

    expect(firstReloaded?.is_default).toBe(false);
    expect(secondReloaded?.is_default).toBe(true);
  });

  it('deleteAddress() only removes an address owned by that customer', async () => {
    const customerA = await repository.create({ businessId, firstName: 'A' });
    const customerB = await repository.create({ businessId, firstName: 'B' });
    const address = await repository.createAddress(customerA.id, {
      address: 'Calle 1',
    });

    expect(await repository.deleteAddress(address.id, customerB.id)).toBe(
      false,
    );
    expect(await repository.deleteAddress(address.id, customerA.id)).toBe(true);
  });

  it('findAll() searches across name, phone, and email', async () => {
    await repository.create({
      businessId,
      firstName: 'Carlos',
      phone: '3009998888',
    });

    const { rows } = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      search: '3009998888',
    });
    expect(rows.some((row) => row.first_name === 'Carlos')).toBe(true);
  });
});
