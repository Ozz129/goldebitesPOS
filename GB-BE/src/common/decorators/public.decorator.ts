import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'is_public';

/**
 * Marks a route as not requiring authentication. JwtAuthGuard checks this
 * metadata before running the JWT strategy.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
