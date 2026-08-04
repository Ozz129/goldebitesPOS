import { SetMetadata } from '@nestjs/common';

export const REQUIRES_PLATFORM_ADMIN_KEY = 'requiresPlatformAdmin';

/** Restricts a route to users flagged is_platform_admin — cross-tenant platform operators, not tenant SUPER_ADMINs. */
export const RequirePlatformAdmin = () =>
  SetMetadata(REQUIRES_PLATFORM_ADMIN_KEY, true);
