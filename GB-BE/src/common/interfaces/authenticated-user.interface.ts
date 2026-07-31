/**
 * Shape attached to `request.user` once a request passes JwtAuthGuard.
 * Populated straight from the JWT payload — no DB round-trip per request.
 */
export interface AuthenticatedUser {
  userId: string;
  businessId: string;
  branchId: string | null;
  roleId: string;
  roleName: string;
  permissions: string[];
}
