import { Sauce, SauceRow } from '../domain/sauce.interface';

export class SauceMapper {
  static toDomain(row: SauceRow): Sauce {
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
