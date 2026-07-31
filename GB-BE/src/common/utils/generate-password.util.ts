import { randomBytes } from 'node:crypto';

/** Unambiguous charset — no 0/O/1/l/I — so a temporary password is easy to read/type aloud. */
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

/** Generates a random temporary password shown once to the admin who provisions employee access. */
export function generateTemporaryPassword(length = 12): string {
  const bytes = randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += CHARSET[bytes[i] % CHARSET.length];
  }
  return password;
}
