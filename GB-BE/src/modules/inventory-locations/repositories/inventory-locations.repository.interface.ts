import { DbClient } from '../../../database/types/database.types';
import { InventoryLocationRow } from '../domain/inventory-location.interface';
import {
  CreateInventoryLocationData,
  InventoryLocationQuery,
  UpdateInventoryLocationData,
} from '../domain/inventory-location.types';

export interface IInventoryLocationsRepository {
  create(
    data: CreateInventoryLocationData,
    client?: DbClient,
  ): Promise<InventoryLocationRow>;
  findById(
    id: string,
    branchId: string,
    client?: DbClient,
  ): Promise<InventoryLocationRow | null>;
  findAll(
    query: InventoryLocationQuery,
  ): Promise<{ rows: InventoryLocationRow[]; total: number }>;
  update(
    id: string,
    branchId: string,
    data: UpdateInventoryLocationData,
    client?: DbClient,
  ): Promise<InventoryLocationRow | null>;
  setActive(
    id: string,
    branchId: string,
    isActive: boolean,
  ): Promise<InventoryLocationRow | null>;
  existsByName(
    branchId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;
}

export const INVENTORY_LOCATIONS_REPOSITORY = Symbol(
  'INVENTORY_LOCATIONS_REPOSITORY',
);
