import { User, UserRow } from '../domain/user.interface';

export class UserMapper {
  static toDomain(row: UserRow): User {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      roleId: row.role_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      status: row.status,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
