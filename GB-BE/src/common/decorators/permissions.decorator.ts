import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Restricts a route to users whose flattened permission set includes every
 * code listed here (AND semantics). Codes follow the `<module>.<action>`
 * convention, e.g. 'orders.create'.
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
