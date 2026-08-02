import { existsSync, mkdirSync, unlink } from 'node:fs';
import { join } from 'node:path';

/**
 * Mounted as a named Docker volume in production (docker-compose.prod.yml)
 * so uploaded files survive a container rebuild.
 */
export const DOCUMENT_SCANS_UPLOADS_DIR =
  process.env.DOCUMENT_SCANS_UPLOADS_DIR ??
  join(process.cwd(), 'uploads', 'document-scans');

export function ensureDocumentScansUploadsDir(): void {
  if (!existsSync(DOCUMENT_SCANS_UPLOADS_DIR)) {
    mkdirSync(DOCUMENT_SCANS_UPLOADS_DIR, { recursive: true });
  }
}

/** Best-effort delete — a missing file should never block deleting the DB row. */
export function deleteDocumentScanFile(storagePath: string): void {
  unlink(storagePath, () => undefined);
}
