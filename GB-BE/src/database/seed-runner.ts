import 'reflect-metadata';
import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
} from '../common/constants/permissions.constants';
import { SYSTEM_ROLES } from '../common/constants/roles.constants';
import { DatabaseService } from './database.service';
import { BranchesService } from '../modules/branches/services/branches.service';
import { BusinessesService } from '../modules/businesses/services/businesses.service';
import { RolesService } from '../modules/roles/services/roles.service';
import { UsersService } from '../modules/users/services/users.service';
import { createScriptClient } from './scripts/db-client';

const SEEDS_DIR = join(__dirname, '..', '..', 'database', 'seeds');

const GOLDEN_BITES_BUSINESS_NAME = 'Golden Bites';
const GOLDEN_BITES_ADMIN_EMAIL = 'admin@goldenbites.local';
const GOLDEN_BITES_ADMIN_PASSWORD = 'ChangeMe123!';

async function runSqlSeeds(): Promise<void> {
  const client = createScriptClient();
  await client.connect();

  try {
    let files: string[] = [];
    try {
      files = readdirSync(SEEDS_DIR)
        .filter((file) => file.endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b));
    } catch {
      console.log('No seeds directory found, skipping SQL seeds.');
      return;
    }

    if (files.length === 0) {
      console.log('No SQL seed files found in database/seeds.');
      return;
    }

    for (const file of files) {
      console.log(`SEEDING ${file}...`);
      const content = readFileSync(join(SEEDS_DIR, file), 'utf-8');
      await client.query('BEGIN');
      try {
        await client.query(content);
        await client.query('COMMIT');
        console.log(`DONE    ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`FAILED  ${file}`);
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

/** Idempotent: inserts any permission codes missing from the catalog. */
async function seedPermissionsCatalog(db: DatabaseService): Promise<void> {
  for (const permission of PERMISSIONS) {
    await db.query(
      `INSERT INTO permissions (code, module, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO NOTHING`,
      [permission.code, permission.module, permission.description],
    );
  }
  console.log(`Permissions catalog up to date (${PERMISSIONS.length} codes).`);
}

/**
 * Bootstraps the Golden Bites business itself: business, main branch, the
 * system role catalog (via BusinessesService, which provisions roles as
 * part of business creation) and a SUPER_ADMIN dev user. The business/branch/
 * admin are only created once, but the permission sync below always runs so
 * that system roles created by an earlier version of DEFAULT_ROLE_PERMISSIONS
 * pick up newly added permission codes on every `npm run seed`.
 */
async function seedGoldenBites(
  db: DatabaseService,
  businessesService: BusinessesService,
  branchesService: BranchesService,
  rolesService: RolesService,
  usersService: UsersService,
): Promise<void> {
  const existing = await db.query<{ id: string }>(
    'SELECT id FROM businesses WHERE name = $1',
    [GOLDEN_BITES_BUSINESS_NAME],
  );

  let businessId: string;

  if (existing.rows.length > 0) {
    businessId = existing.rows[0].id;
    console.log(
      `"${GOLDEN_BITES_BUSINESS_NAME}" already exists, skipping creation.`,
    );
  } else {
    const business = await businessesService.create({
      name: GOLDEN_BITES_BUSINESS_NAME,
      currency: 'COP',
      timezone: 'America/Bogota',
    });
    businessId = business.id;
    console.log(`Created business "${business.name}" (${business.id}).`);

    const branch = await branchesService.create({
      businessId: business.id,
      name: 'Sede Principal',
    });
    console.log(`Created branch "${branch.name}" (${branch.id}).`);

    const roles = await rolesService.findAllForBusiness(business.id);
    console.log(
      `Provisioned ${roles.length} system roles: ${SYSTEM_ROLES.join(', ')}.`,
    );

    const superAdminRole = roles.find((role) => role.name === 'SUPER_ADMIN');
    if (!superAdminRole) {
      throw new Error(
        'SUPER_ADMIN role was not provisioned for the new business.',
      );
    }

    await usersService.create(business.id, {
      firstName: 'Admin',
      lastName: 'Golden Bites',
      email: GOLDEN_BITES_ADMIN_EMAIL,
      password: GOLDEN_BITES_ADMIN_PASSWORD,
      roleId: superAdminRole.id,
      branchId: branch.id,
    });

    console.log(
      '\n=================================================================',
    );
    console.log('  Dev admin user created:');
    console.log(`    email:    ${GOLDEN_BITES_ADMIN_EMAIL}`);
    console.log(`    password: ${GOLDEN_BITES_ADMIN_PASSWORD}`);
    console.log(
      '  CHANGE THIS PASSWORD before using the system outside development.',
    );
    console.log(
      '=================================================================\n',
    );
  }

  await syncSystemRolePermissions(businessId, rolesService);
}

/** Re-applies DEFAULT_ROLE_PERMISSIONS to every system role, granting any newly added codes. */
async function syncSystemRolePermissions(
  businessId: string,
  rolesService: RolesService,
): Promise<void> {
  const roles = await rolesService.findAllForBusiness(businessId);
  let syncedCount = 0;

  for (const roleName of SYSTEM_ROLES) {
    const role = roles.find((r) => r.name === roleName);
    if (!role) {
      continue;
    }
    await rolesService.setPermissions(
      businessId,
      role.id,
      DEFAULT_ROLE_PERMISSIONS[roleName],
    );
    syncedCount += 1;
  }

  console.log(`Synced permissions for ${syncedCount} system role(s).`);
}

async function run(): Promise<void> {
  await runSqlSeeds();

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const db = app.get(DatabaseService);
    await seedPermissionsCatalog(db);
    await seedGoldenBites(
      db,
      app.get(BusinessesService),
      app.get(BranchesService),
      app.get(RolesService),
      app.get(UsersService),
    );
    console.log('Seeding complete.');
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error(
    'Seed run failed:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
