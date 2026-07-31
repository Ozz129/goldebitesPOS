import { Branch, BranchRow } from '../domain/branch.interface';

export class BranchMapper {
  static toDomain(row: BranchRow): Branch {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      address: row.address,
      city: row.city,
      phone: row.phone,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
