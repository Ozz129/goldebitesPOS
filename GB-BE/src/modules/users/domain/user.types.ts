export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export interface CreateUserData {
  businessId: string;
  branchId?: string | null;
  roleId: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
}

export interface UpdateUserData {
  branchId?: string | null;
  roleId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UserQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: UserStatus;
  roleId?: string;
  branchId?: string;
  search?: string;
}
