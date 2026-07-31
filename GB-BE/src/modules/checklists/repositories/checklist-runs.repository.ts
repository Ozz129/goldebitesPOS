import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import {
  ChecklistRunItemRow,
  ChecklistRunRow,
} from '../domain/checklist.interface';
import {
  ChecklistRunQuery,
  ChecklistRunStatus,
  ItemResultInput,
  StartChecklistRunData,
} from '../domain/checklist.types';
import { IChecklistRunsRepository } from './checklist-runs.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, template_id, status, started_by, started_at, completed_at, observations`;
const ITEM_COLUMNS = `id, run_id, template_item_id, label_snapshot, checked, display_order`;

interface CountRow {
  count: string;
}

@Injectable()
export class ChecklistRunsRepository implements IChecklistRunsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: StartChecklistRunData,
    startedBy: string | undefined,
    client?: DbClient,
  ): Promise<ChecklistRunRow> {
    const result = await this.db.query<ChecklistRunRow>(
      `INSERT INTO checklist_runs (business_id, branch_id, template_id, started_by)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_COLUMNS}`,
      [data.businessId, data.branchId, data.templateId, startedBy ?? null],
      client,
    );
    return result.rows[0];
  }

  async addItems(
    runId: string,
    items: { templateItemId: string; label: string; displayOrder: number }[],
    client?: DbClient,
  ): Promise<ChecklistRunItemRow[]> {
    const inserted: ChecklistRunItemRow[] = [];
    for (const item of items) {
      const result = await this.db.query<ChecklistRunItemRow>(
        `INSERT INTO checklist_run_items (run_id, template_item_id, label_snapshot, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING ${ITEM_COLUMNS}`,
        [runId, item.templateItemId, item.label, item.displayOrder],
        client,
      );
      inserted.push(result.rows[0]);
    }
    return inserted;
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ChecklistRunRow | null> {
    const result = await this.db.query<ChecklistRunRow>(
      `SELECT ${SELECT_COLUMNS} FROM checklist_runs WHERE id = $1 AND business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: ChecklistRunQuery,
  ): Promise<{ rows: ChecklistRunRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.templateId) {
      params.push(query.templateId);
      conditions.push(`template_id = $${params.length}`);
    }

    if (query.branchId) {
      params.push(query.branchId);
      conditions.push(`branch_id = $${params.length}`);
    }

    if (query.status) {
      params.push(query.status);
      conditions.push(`status = $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM checklist_runs WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<ChecklistRunRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM checklist_runs
       WHERE ${whereClause}
       ORDER BY started_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async findItems(
    runId: string,
    client?: DbClient,
  ): Promise<ChecklistRunItemRow[]> {
    const result = await this.db.query<ChecklistRunItemRow>(
      `SELECT ${ITEM_COLUMNS} FROM checklist_run_items WHERE run_id = $1 ORDER BY display_order`,
      [runId],
      client,
    );
    return result.rows;
  }

  async updateItemResults(
    runId: string,
    items: ItemResultInput[],
    client?: DbClient,
  ): Promise<ChecklistRunItemRow[]> {
    for (const item of items) {
      await this.db.query(
        `UPDATE checklist_run_items SET checked = $3 WHERE id = $1 AND run_id = $2`,
        [item.id, runId, item.checked],
        client,
      );
    }
    return this.findItems(runId, client);
  }

  async complete(
    id: string,
    businessId: string,
    status: ChecklistRunStatus,
    observations: string | undefined,
    client?: DbClient,
  ): Promise<ChecklistRunRow | null> {
    const result = await this.db.query<ChecklistRunRow>(
      `UPDATE checklist_runs
       SET status = $3, observations = COALESCE($4, observations), completed_at = now()
       WHERE id = $1 AND business_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, status, observations ?? null],
      client,
    );
    return result.rows[0] ?? null;
  }
}
