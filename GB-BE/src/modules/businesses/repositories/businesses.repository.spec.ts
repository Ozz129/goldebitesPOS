import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { BusinessesRepository } from './businesses.repository';

/**
 * Integration test against the real test database (golden_bites_test).
 * updateTaxRate() is a regression test for the Fase 6 Settings feature:
 * Purchases and Orders previously hard-coded a 0 tax rate because this
 * column did not exist.
 */
describe('BusinessesRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: BusinessesRepository;
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
    repository = new BusinessesRepository(db);

    const created = await repository.create({
      name: `Test Business ${randomUUID()}`,
    });
    businessId = created.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('create() defaults tax_rate to 0', async () => {
    const business = await repository.findById(businessId);
    expect(business?.tax_rate).toBe('0.0000');
  });

  it('updateTaxRate() persists a fractional rate', async () => {
    const updated = await repository.updateTaxRate(businessId, 0.19);
    expect(updated?.tax_rate).toBe('0.1900');
  });

  it('rejects a tax_rate outside [0, 1] at the database level', async () => {
    await expect(repository.updateTaxRate(businessId, 1.5)).rejects.toThrow();
  });
});
