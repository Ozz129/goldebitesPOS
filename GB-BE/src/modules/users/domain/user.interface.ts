import { UserStatus } from './user.types';

/** Public-facing user shape — never carries password_hash. */
export interface User {
  id: string;
  businessId: string;
  branchId: string | null;
  roleId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Full row as stored, including the credential — internal use only. */
export interface UserRow {
  id: string;
  business_id: string;
  branch_id: string | null;
  role_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  status: UserStatus;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
