import { DbClient } from '../../../database/types/database.types';
import { WasteRecordRow } from '../domain/waste-record.interface';
import {
  CreateWasteRecordData,
  WasteRecordQuery,
} from '../domain/waste-record.types';

export interface IWasteRecordsRepository {
  create(
    data: CreateWasteRecordData,
    unitCost: number | null,
    recordedBy: string | undefined,
    client?: DbClient,
  ): Promise<WasteRecordRow>;
  findAll(
    query: WasteRecordQuery,
  ): Promise<{ rows: WasteRecordRow[]; total: number }>;
}

export const WASTE_RECORDS_REPOSITORY = Symbol('WASTE_RECORDS_REPOSITORY');
