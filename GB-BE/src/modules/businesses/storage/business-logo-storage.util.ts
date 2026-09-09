import { existsSync, mkdirSync, unlink } from 'node:fs';
import { join } from 'node:path';

/**
 * Mounted as a named Docker volume in production (docker-compose.prod.yml)
 * so uploaded files survive a container rebuild.
 */
export const BUSINESS_LOGOS_UPLOADS_DIR =
  process.env.BUSINESS_LOGOS_UPLOADS_DIR ??
  join(process.cwd(), 'uploads', 'business-logos');

export function ensureBusinessLogosUploadsDir(): void {
  if (!existsSync(BUSINESS_LOGOS_UPLOADS_DIR)) {
    mkdirSync(BUSINESS_LOGOS_UPLOADS_DIR, { recursive: true });
  }
}

/** Best-effort delete — a missing file should never block replacing/clearing the logo. */
export function deleteBusinessLogoFile(storagePath: string): void {
  unlink(storagePath, () => undefined);
}
