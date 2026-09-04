import { Side, SideRow } from '../domain/side.interface';

export class SideMapper {
  static toDomain(row: SideRow): Side {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      description: row.description,
      displayOrder: row.display_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
