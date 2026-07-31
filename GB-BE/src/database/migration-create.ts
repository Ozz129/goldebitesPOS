import { writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'database', 'migrations');

function nextSequence(): string {
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));
  const numbers = files
    .map((f) => parseInt(f.split('_')[0], 10))
    .filter((n) => !isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return next.toString().padStart(3, '0');
}

function run(): void {
  const rawName = process.argv[2];
  if (!rawName) {
    console.error('Usage: npm run migration:create -- <migration_name>');
    process.exit(1);
  }

  const slug = rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const sequence = nextSequence();
  const fileName = `${sequence}_${slug}.sql`;
  const filePath = join(MIGRATIONS_DIR, fileName);

  writeFileSync(
    filePath,
    `-- Migration: ${fileName}\n-- Created: ${new Date().toISOString()}\n\n`,
  );

  console.log(`Created ${filePath}`);
}

run();
