import {
  Customer,
  CustomerAddress,
  CustomerAddressRow,
  CustomerRow,
} from '../domain/customer.interface';

export class CustomerMapper {
  static toDomain(row: CustomerRow): Customer {
    return {
      id: row.id,
      businessId: row.business_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      documentNumber: row.document_number,
      birthDate: row.birth_date,
      notes: row.notes,
      totalOrders: row.total_orders,
      totalSpent: parseFloat(row.total_spent),
      loyaltyPoints: row.loyalty_points,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }

  static addressToDomain(row: CustomerAddressRow): CustomerAddress {
    return {
      id: row.id,
      customerId: row.customer_id,
      label: row.label,
      address: row.address,
      city: row.city,
      instructions: row.instructions,
      isDefault: row.is_default,
      createdAt: row.created_at,
    };
  }
}
