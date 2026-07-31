export interface JwtPayload {
  sub: string;
  businessId: string;
  branchId: string | null;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthenticatedProfile {
  id: string;
  businessId: string;
  branchId: string | null;
  roleId: string;
  roleName: string;
  firstName: string;
  lastName: string;
  email: string;
}
