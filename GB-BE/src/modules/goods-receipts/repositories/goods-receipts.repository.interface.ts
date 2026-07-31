import { DbClient } from '../../../database/types/database.types';
import {
  GoodsReceiptItemRow,
  GoodsReceiptRow,
} from '../domain/goods-receipt.interface';
import {
  CreateGoodsReceiptData,
  GoodsReceiptItemInput,
  GoodsReceiptQuery,
} from '../domain/goods-receipt.types';

export interface IGoodsReceiptsRepository {
  create(
    data: CreateGoodsReceiptData,
    receivedBy: string | undefined,
    client?: DbClient,
  ): Promise<GoodsReceiptRow>;
  addItems(
    goodsReceiptId: string,
    items: (GoodsReceiptItemInput & { inventoryItemId: string })[],
    client?: DbClient,
  ): Promise<void>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<GoodsReceiptRow | null>;
  findAll(
    query: GoodsReceiptQuery,
  ): Promise<{ rows: GoodsReceiptRow[]; total: number }>;
  findItems(
    goodsReceiptId: string,
    client?: DbClient,
  ): Promise<GoodsReceiptItemRow[]>;
}

export const GOODS_RECEIPTS_REPOSITORY = Symbol('GOODS_RECEIPTS_REPOSITORY');
