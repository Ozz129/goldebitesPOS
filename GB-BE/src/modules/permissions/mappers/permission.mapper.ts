import { Permission, PermissionRow } from '../domain/permission.interface';

export class PermissionMapper {
  static toDomain(row: PermissionRow): Permission {
    return {
      id: row.id,
      code: row.code,
      module: row.module,
      description: row.description,
      createdAt: row.created_at,
    };
  }
}
