import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { WasteRecordRow } from '../domain/waste-record.interface';
import {
  CreateWasteRecordData,
  WasteRecordQuery,
} from '../domain/waste-record.types';
import { IWasteRecordsRepository } from './waste-records.repository.interface';

const SELECT_COLUMNS = `wr.id, wr.business_id, wr.branch_id, wr.inventory_item_id, ii.name AS inventory_item_name,
  wr.quantity, wr.unit_cost, wr.reason, wr.notes, wr.recorded_by, wr.created_at`;

const FROM_JOIN = `FROM waste_records wr JOIN inventory_items ii ON ii.id = wr.inventory_item_id`;

interface CountRow {
  count: string;
}

@Injectable()
export class WasteRecordsRepository implements IWasteRecordsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateWasteRecordData,
    unitCost: number | null,
    recordedBy: string | undefined,
    client?: DbClient,
  ): Promise<WasteRecordRow> {
    const result = await this.db.query<WasteRecordRow>(
      `WITH inserted AS (
         INSERT INTO waste_records (business_id, branch_id, inventory_item_id, quantity, unit_cost, reason, notes, recorded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *
       )
       SELECT ${SELECT_COLUMNS}
       FROM inserted wr
       JOIN inventory_items ii ON ii.id = wr.inventory_item_id`,
      [
        data.businessId,
        data.branchId,
        data.inventoryItemId,
        data.quantity,
        unitCost,
        data.reason,
        data.notes ?? null,
        recordedBy ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findAll(
    query: WasteRecordQuery,
  ): Promise<{ rows: WasteRecordRow[]; total: number }> {
    const conditions: string[] = ['wr.business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.branchId) {
      params.push(query.branchId);
      conditions.push(`wr.branch_id = $${params.length}`);
    }
    if (query.inventoryItemId) {
      params.push(query.inventoryItemId);
      conditions.push(`wr.inventory_item_id = $${params.length}`);
    }
    if (query.dateFrom) {
      params.push(query.dateFrom);
      conditions.push(`wr.created_at >= $${params.length}`);
    }
    if (query.dateTo) {
      params.push(query.dateTo);
      conditions.push(`wr.created_at <= $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count ${FROM_JOIN} WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<WasteRecordRow>(
      `SELECT ${SELECT_COLUMNS}
       ${FROM_JOIN}
       WHERE ${whereClause}
       ORDER BY wr.created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }
}
