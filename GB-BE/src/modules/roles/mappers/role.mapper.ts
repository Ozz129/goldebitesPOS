import { Role, RoleRow } from '../domain/role.interface';

export class RoleMapper {
  static toDomain(row: RoleRow): Role {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
    };
  }
}
