import { DbClient } from '../../../database/types/database.types';
import { InventoryItemCategoryRow } from '../domain/inventory-item-category.interface';
import {
  CreateInventoryItemCategoryData,
  InventoryItemCategoryQuery,
  UpdateInventoryItemCategoryData,
} from '../domain/inventory-item-category.types';

export interface IInventoryItemCategoriesRepository {
  create(
    data: CreateInventoryItemCategoryData,
    client?: DbClient,
  ): Promise<InventoryItemCategoryRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<InventoryItemCategoryRow | null>;
  findAll(
    query: InventoryItemCategoryQuery,
  ): Promise<{ rows: InventoryItemCategoryRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateInventoryItemCategoryData,
    client?: DbClient,
  ): Promise<InventoryItemCategoryRow | null>;
  setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<InventoryItemCategoryRow | null>;
  existsByName(
    businessId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;
}

export const INVENTORY_ITEM_CATEGORIES_REPOSITORY = Symbol(
  'INVENTORY_ITEM_CATEGORIES_REPOSITORY',
);
