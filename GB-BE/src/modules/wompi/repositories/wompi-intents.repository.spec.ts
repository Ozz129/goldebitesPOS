import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { WompiIntentsRepository } from './wompi-intents.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('WompiIntentsRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: WompiIntentsRepository;
  let businessId: string;
  let orderId: string;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: 'golden_bites_test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    db = new DatabaseService(pool);
    repository = new WompiIntentsRepository(db);

    const business = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = business.rows[0].id;

    const branch = await pool.query<{ id: string }>(
      `INSERT INTO branches (business_id, name) VALUES ($1, $2) RETURNING id`,
      [businessId, `Test Branch ${randomUUID()}`],
    );

    const order = await pool.query<{ id: string }>(
      `INSERT INTO orders (business_id, branch_id, order_type, order_number) VALUES ($1, $2, 'DINE_IN', $3) RETURNING id`,
      [businessId, branch.rows[0].id, `TEST-${randomUUID().slice(0, 8)}`],
    );
    orderId = order.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM wompi_payment_intents WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
    await pool.query('DELETE FROM branches WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('create() persists a PENDING intent', async () => {
    const reference = `gbpos-test-${randomUUID().slice(0, 8)}`;

    const intent = await repository.create(
      { businessId, orderId, reference, amountInCents: 500000, payerLabel: 'Persona 1' },
      undefined,
    );

    expect(intent.status).toBe('PENDING');
    expect(intent.amount_in_cents).toBe('500000');
    expect(intent.payer_label).toBe('Persona 1');
  });

  it('findByReference() round-trips what was created', async () => {
    const reference = `gbpos-test-${randomUUID().slice(0, 8)}`;
    await repository.create({ businessId, orderId, reference, amountInCents: 100000 }, undefined);

    const found = await repository.findByReference(reference);
    expect(found?.reference).toBe(reference);
  });

  it('findByReference() returns null for an unknown reference', async () => {
    expect(await repository.findByReference('does-not-exist')).toBeNull();
  });

  it('markResolved() updates status, wompi_transaction_id and payment_id', async () => {
    const reference = `gbpos-test-${randomUUID().slice(0, 8)}`;
    const created = await repository.create(
      { businessId, orderId, reference, amountInCents: 100000 },
      undefined,
    );

    const resolved = await repository.markResolved(created.id, 'DECLINED', 'wtx-123', null);

    expect(resolved?.status).toBe('DECLINED');
    expect(resolved?.wompi_transaction_id).toBe('wtx-123');
    expect(resolved?.payment_id).toBeNull();
  });
});
