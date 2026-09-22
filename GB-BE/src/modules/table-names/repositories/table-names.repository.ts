import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { TableNameRow } from '../domain/table-name.interface';
import { UpsertTableNameData } from '../domain/table-name.types';
import { ITableNamesRepository } from './table-names.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, table_number, name, created_at, updated_at`;

@Injectable()
export class TableNamesRepository implements ITableNamesRepository {
  constructor(private readonly db: DatabaseService) {}

  async upsert(data: UpsertTableNameData): Promise<TableNameRow> {
    const result = await this.db.query<TableNameRow>(
      `INSERT INTO table_names (business_id, branch_id, table_number, name, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (branch_id, table_number) DO UPDATE SET name = EXCLUDED.name
       RETURNING ${SELECT_COLUMNS}`,
      [data.businessId, data.branchId, data.tableNumber, data.name, data.actorUserId ?? null],
    );
    return result.rows[0];
  }

  async findAllByBranch(businessId: string, branchId: string): Promise<TableNameRow[]> {
    const result = await this.db.query<TableNameRow>(
      `SELECT ${SELECT_COLUMNS} FROM table_names WHERE business_id = $1 AND branch_id = $2 ORDER BY table_number`,
      [businessId, branchId],
    );
    return result.rows;
  }

  async findOne(
    businessId: string,
    branchId: string,
    tableNumber: string,
  ): Promise<TableNameRow | null> {
    const result = await this.db.query<TableNameRow>(
      `SELECT ${SELECT_COLUMNS} FROM table_names WHERE business_id = $1 AND branch_id = $2 AND table_number = $3`,
      [businessId, branchId, tableNumber],
    );
    return result.rows[0] ?? null;
  }

  async delete(businessId: string, branchId: string, tableNumber: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM table_names WHERE business_id = $1 AND branch_id = $2 AND table_number = $3`,
      [businessId, branchId, tableNumber],
    );
    return result.rowCount > 0;
  }
}
