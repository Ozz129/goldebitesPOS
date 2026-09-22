import { TableNameRow } from '../domain/table-name.interface';
import { UpsertTableNameData } from '../domain/table-name.types';

export interface ITableNamesRepository {
  upsert(data: UpsertTableNameData): Promise<TableNameRow>;
  findAllByBranch(businessId: string, branchId: string): Promise<TableNameRow[]>;
  findOne(
    businessId: string,
    branchId: string,
    tableNumber: string,
  ): Promise<TableNameRow | null>;
  delete(businessId: string, branchId: string, tableNumber: string): Promise<boolean>;
}

export const TABLE_NAMES_REPOSITORY = Symbol('TABLE_NAMES_REPOSITORY');
