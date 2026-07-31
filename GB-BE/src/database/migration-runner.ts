import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createScriptClient } from './scripts/db-client';

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'database', 'migrations');

interface AppliedMigration {
  migration_name: string;
  checksum: string;
}

function checksum(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function readMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

async function ensureMigrationsTable(client: {
  query: (text: string) => Promise<unknown>;
}): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      checksum VARCHAR(64) NOT NULL
    );
  `);
}

async function run(): Promise<void> {
  const client = createScriptClient();
  await client.connect();

  try {
    await ensureMigrationsTable(client);

    const { rows: applied } = await client.query<AppliedMigration>(
      'SELECT migration_name, checksum FROM schema_migrations',
    );
    const appliedByName = new Map(
      applied.map((row) => [row.migration_name, row.checksum]),
    );

    const files = readMigrationFiles();
    if (files.length === 0) {
      console.log('No migration files found in database/migrations.');
      return;
    }

    let executedCount = 0;

    for (const file of files) {
      const filePath = join(MIGRATIONS_DIR, file);
      const content = readFileSync(filePath, 'utf-8');
      const currentChecksum = checksum(content);
      const previousChecksum = appliedByName.get(file);

      if (previousChecksum) {
        if (previousChecksum !== currentChecksum) {
          throw new Error(
            `Migration "${file}" has already been applied but its content changed ` +
              `(checksum mismatch). Do not edit applied migrations; create a new one instead.`,
          );
        }
        console.log(`SKIP    ${file} (already applied)`);
        continue;
      }

      console.log(`RUNNING ${file}...`);
      await client.query('BEGIN');
      try {
        await client.query(content);
        await client.query(
          'INSERT INTO schema_migrations (migration_name, checksum) VALUES ($1, $2)',
          [file, currentChecksum],
        );
        await client.query('COMMIT');
        console.log(`DONE    ${file}`);
        executedCount += 1;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`FAILED  ${file}`);
        throw error;
      }
    }

    console.log(
      `\nMigrations complete. ${executedCount} applied, ${files.length - executedCount} already up to date.`,
    );
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(
    'Migration run failed:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
