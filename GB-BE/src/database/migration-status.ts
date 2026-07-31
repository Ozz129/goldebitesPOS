import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createScriptClient } from './scripts/db-client';

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'database', 'migrations');

interface AppliedMigration {
  migration_name: string;
  executed_at: Date;
  checksum: string;
}

function checksum(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

async function run(): Promise<void> {
  const client = createScriptClient();
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        checksum VARCHAR(64) NOT NULL
      );
    `);

    const { rows: applied } = await client.query<AppliedMigration>(
      'SELECT migration_name, executed_at, checksum FROM schema_migrations ORDER BY migration_name',
    );
    const appliedByName = new Map(
      applied.map((row) => [row.migration_name, row]),
    );

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    console.log('Migration status:\n');
    console.log(
      `${'STATUS'.padEnd(10)}${'MIGRATION'.padEnd(40)}${'EXECUTED AT'.padEnd(28)}NOTES`,
    );

    for (const file of files) {
      const record = appliedByName.get(file);
      if (!record) {
        console.log(
          `${'PENDING'.padEnd(10)}${file.padEnd(40)}${''.padEnd(28)}`,
        );
        continue;
      }

      const content = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
      const currentChecksum = checksum(content);
      const drifted = currentChecksum !== record.checksum;

      console.log(
        `${'APPLIED'.padEnd(10)}${file.padEnd(40)}${record.executed_at.toISOString().padEnd(28)}${
          drifted ? 'CHECKSUM MISMATCH' : ''
        }`,
      );
    }

    const pendingCount = files.filter((f) => !appliedByName.has(f)).length;
    console.log(`\n${applied.length} applied, ${pendingCount} pending.`);
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(
    'Failed to read migration status:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
