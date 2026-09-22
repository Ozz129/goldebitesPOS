import { SetMetadata } from '@nestjs/common';

export const SKIP_MUST_CHANGE_PASSWORD_KEY = 'skipMustChangePassword';

/**
 * Exempts a route from MustChangePasswordGuard — a user whose account is
 * flagged mustChangePassword can still reach this handler even though every
 * other endpoint is blocked. Applied only to change-password and logout.
 */
export const SkipMustChangePassword = () =>
  SetMetadata(SKIP_MUST_CHANGE_PASSWORD_KEY, true);
