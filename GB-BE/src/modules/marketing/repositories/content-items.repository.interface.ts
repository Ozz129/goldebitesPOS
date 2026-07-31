import { DbClient } from '../../../database/types/database.types';
import { ContentItemRow } from '../domain/marketing.interface';
import {
  ContentItemQuery,
  CreateContentItemData,
  UpdateContentItemData,
} from '../domain/marketing.types';

export interface IContentItemsRepository {
  create(
    data: CreateContentItemData,
    client?: DbClient,
  ): Promise<ContentItemRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ContentItemRow | null>;
  findAll(
    query: ContentItemQuery,
  ): Promise<{ rows: ContentItemRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateContentItemData,
  ): Promise<ContentItemRow | null>;
  softDelete(id: string, businessId: string): Promise<ContentItemRow | null>;
}

export const CONTENT_ITEMS_REPOSITORY = Symbol('CONTENT_ITEMS_REPOSITORY');
