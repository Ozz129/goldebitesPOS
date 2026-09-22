import { TableName, TableNameRow } from '../domain/table-name.interface';

export class TableNameMapper {
  static toDomain(row: TableNameRow): TableName {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      tableNumber: row.table_number,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
