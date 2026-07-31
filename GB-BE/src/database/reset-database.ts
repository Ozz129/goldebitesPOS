import 'dotenv/config';
import { execSync } from 'node:child_process';
import { createScriptClient } from './scripts/db-client';

/**
 * Drops and recreates the public schema, then re-runs migrations and seeds.
 * Intended for local development and test databases only.
 */
async function run(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run db:reset when NODE_ENV=production.');
    process.exit(1);
  }

  const client = createScriptClient();
  await client.connect();

  try {
    console.log(`Resetting database "${process.env.DB_NAME}"...`);
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    console.log('Schema recreated.');
  } finally {
    await client.end();
  }

  console.log('Running migrations...');
  execSync('npm run migration:run', { stdio: 'inherit' });

  console.log('Running seeds...');
  execSync('npm run seed', { stdio: 'inherit' });

  console.log('\nDatabase reset complete.');
}

run().catch((error) => {
  console.error(
    'Database reset failed:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
