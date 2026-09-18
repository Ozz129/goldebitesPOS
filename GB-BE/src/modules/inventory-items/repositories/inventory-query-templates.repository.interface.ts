import { DbClient } from '../../../database/types/database.types';
import { CreateInventoryQueryTemplateData, InventoryQueryTemplateRow } from '../domain/inventory-query.types';

export interface IInventoryQueryTemplatesRepository {
  create(
    data: CreateInventoryQueryTemplateData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<InventoryQueryTemplateRow>;
  findAll(businessId: string): Promise<InventoryQueryTemplateRow[]>;
  findById(id: string, businessId: string): Promise<InventoryQueryTemplateRow | null>;
  delete(id: string, businessId: string): Promise<boolean>;
}

export const INVENTORY_QUERY_TEMPLATES_REPOSITORY = Symbol('INVENTORY_QUERY_TEMPLATES_REPOSITORY');
