import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to users whose role name matches one of the given
 * values. Prefer @Permissions() for fine-grained checks; use @Roles() only
 * when the rule is genuinely about the role itself (e.g. SUPER_ADMIN-only).
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
