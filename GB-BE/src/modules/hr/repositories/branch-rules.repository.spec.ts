import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { BranchRulesRepository } from './branch-rules.repository';

/**
 * Integration test against the real test database (golden_bites_test).
 * Focuses on replaceAll()'s delete-then-reinsert behavior and display_order
 * assignment — the whole point of this table is "the admin edits the full
 * list at once", same pattern as checklist_template_items.
 */
describe('BranchRulesRepository (integration)', () => {
  let pool: Pool;
  let db: DatabaseService;
  let repository: BranchRulesRepository;
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
    repository = new BranchRulesRepository(db);

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
    await pool.query('DELETE FROM branch_rules WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM branches WHERE business_id = $1', [businessId]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.end();
  });

  it('replaceAll() inserts rows in order and assigns display_order from array index', async () => {
    const rows = await repository.replaceAll(businessId, branchId, [
      { title: 'Uniforme', description: 'Camisa negra y delantal' },
      { title: 'Puntualidad' },
    ]);

    expect(rows.map((r) => r.title)).toEqual(['Uniforme', 'Puntualidad']);
    expect(rows.map((r) => r.display_order)).toEqual([0, 1]);
    expect(rows[1].description).toBeNull();
  });

  it('replaceAll() wipes the previous list — a shorter second call drops the extra rows', async () => {
    await repository.replaceAll(businessId, branchId, [
      { title: 'Uniforme' },
      { title: 'Puntualidad' },
      { title: 'No fumar' },
    ]);

    const replaced = await repository.replaceAll(businessId, branchId, [{ title: 'Solo esta' }]);

    expect(replaced).toHaveLength(1);
    const all = await repository.findAllByBranch(businessId, branchId);
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Solo esta');
  });

  it('replaceAll() with an empty list clears all rules for the branch', async () => {
    await repository.replaceAll(businessId, branchId, [{ title: 'Temporal' }]);
    await repository.replaceAll(businessId, branchId, []);

    expect(await repository.findAllByBranch(businessId, branchId)).toEqual([]);
  });

  it('findAllByBranch() only returns rows scoped to that business/branch', async () => {
    const otherBusiness = await pool.query<{ id: string }>(
      `INSERT INTO businesses (name) VALUES ($1) RETURNING id`,
      [`Other Business ${randomUUID()}`],
    );
    const otherBranch = await pool.query<{ id: string }>(
      `INSERT INTO branches (business_id, name) VALUES ($1, $2) RETURNING id`,
      [otherBusiness.rows[0].id, `Other Branch ${randomUUID()}`],
    );
    await repository.replaceAll(otherBusiness.rows[0].id, otherBranch.rows[0].id, [
      { title: 'No debería aparecer' },
    ]);
    await repository.replaceAll(businessId, branchId, [{ title: 'Mía' }]);

    const rules = await repository.findAllByBranch(businessId, branchId);
    expect(rules.some((r) => r.title === 'No debería aparecer')).toBe(false);

    await pool.query('DELETE FROM branch_rules WHERE business_id = $1', [otherBusiness.rows[0].id]);
    await pool.query('DELETE FROM branches WHERE business_id = $1', [otherBusiness.rows[0].id]);
    await pool.query('DELETE FROM businesses WHERE id = $1', [otherBusiness.rows[0].id]);
  });
});
