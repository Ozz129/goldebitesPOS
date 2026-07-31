import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { UserStatus } from '../domain/user.types';
import { UsersRepository } from './users.repository';

/** Integration test against the real test database (golden_bites_test). */
describe('UsersRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: UsersRepository;
  let businessId: string;
  let roleId: string;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: 'golden_bites_test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    db = new DatabaseService(pool);
    repository = new UsersRepository(db);

    const businessResult = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Test Business ${randomUUID()}`],
    );
    businessId = businessResult.rows[0].id;

    const roleResult = await pool.query<{ id: string }>(
      `INSERT INTO roles (business_id, name) VALUES ($1, $2) RETURNING id`,
      [businessId, 'TEST_ROLE'],
    );
    roleId = roleResult.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM roles WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  function uniqueEmail(): string {
    return `${randomUUID()}@repo-test.local`;
  }

  it('creates a user and finds it scoped to its business', async () => {
    const email = uniqueEmail();
    const created = await repository.create({
      businessId,
      roleId,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email,
      passwordHash: 'hash',
    });

    expect(created.email).toBe(email);
    expect(created.status).toBe(UserStatus.ACTIVE);

    const found = await repository.findById(created.id, businessId);
    expect(found?.id).toBe(created.id);

    expect(await repository.findById(created.id, randomUUID())).toBeNull();
  });

  it('findByIdUnscoped() finds a user without a business filter', async () => {
    const created = await repository.create({
      businessId,
      roleId,
      firstName: 'Grace',
      lastName: 'Hopper',
      email: uniqueEmail(),
      passwordHash: 'hash',
    });

    const found = await repository.findByIdUnscoped(created.id);
    expect(found?.id).toBe(created.id);
  });

  it('findActiveByEmailAcrossBusinesses() ignores soft-deleted users', async () => {
    const email = uniqueEmail();
    const created = await repository.create({
      businessId,
      roleId,
      firstName: 'Grace',
      lastName: 'Hopper',
      email,
      passwordHash: 'hash',
    });

    expect(
      await repository.findActiveByEmailAcrossBusinesses(email),
    ).toHaveLength(1);

    await repository.softDelete(created.id, businessId);
    expect(
      await repository.findActiveByEmailAcrossBusinesses(email),
    ).toHaveLength(0);
  });

  it('existsByEmailInBusiness() detects duplicates and excludes the current row', async () => {
    const email = uniqueEmail();
    const created = await repository.create({
      businessId,
      roleId,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email,
      passwordHash: 'hash',
    });

    expect(await repository.existsByEmailInBusiness(businessId, email)).toBe(
      true,
    );
    expect(
      await repository.existsByEmailInBusiness(businessId, email, created.id),
    ).toBe(false);
  });

  it('findAll() filters by status and search text, and paginates', async () => {
    const email = uniqueEmail();
    const user = await repository.create({
      businessId,
      roleId,
      firstName: 'Searchable',
      lastName: 'Person',
      email,
      passwordHash: 'hash',
    });
    await repository.setStatus(user.id, businessId, UserStatus.BLOCKED);

    const blocked = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      status: UserStatus.BLOCKED,
    });
    expect(blocked.rows.some((row) => row.id === user.id)).toBe(true);

    const bySearch = await repository.findAll({
      businessId,
      page: 1,
      limit: 50,
      search: 'Searchable',
    });
    expect(bySearch.rows.some((row) => row.id === user.id)).toBe(true);
  });

  it('update() applies partial changes, ignoring soft-deleted users', async () => {
    const created = await repository.create({
      businessId,
      roleId,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: uniqueEmail(),
      passwordHash: 'hash',
    });

    const updated = await repository.update(created.id, businessId, {
      firstName: 'Augusta',
    });
    expect(updated?.first_name).toBe('Augusta');

    await repository.softDelete(created.id, businessId);
    const afterDelete = await repository.update(created.id, businessId, {
      firstName: 'Nope',
    });
    expect(afterDelete).toBeNull();
  });

  it('updatePasswordHash() and updateLastLoginAt() mutate the expected columns', async () => {
    const created = await repository.create({
      businessId,
      roleId,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: uniqueEmail(),
      passwordHash: 'old-hash',
    });

    await repository.updatePasswordHash(created.id, 'new-hash');
    await repository.updateLastLoginAt(created.id);

    const updated = await repository.findById(created.id, businessId);
    expect(updated?.password_hash).toBe('new-hash');
    expect(updated?.last_login_at).not.toBeNull();
  });
});
