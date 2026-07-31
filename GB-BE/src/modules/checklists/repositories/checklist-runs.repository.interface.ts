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

export interface IChecklistRunsRepository {
  create(
    data: StartChecklistRunData,
    startedBy: string | undefined,
    client?: DbClient,
  ): Promise<ChecklistRunRow>;
  addItems(
    runId: string,
    items: { templateItemId: string; label: string; displayOrder: number }[],
    client?: DbClient,
  ): Promise<ChecklistRunItemRow[]>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ChecklistRunRow | null>;
  findAll(
    query: ChecklistRunQuery,
  ): Promise<{ rows: ChecklistRunRow[]; total: number }>;
  findItems(runId: string, client?: DbClient): Promise<ChecklistRunItemRow[]>;
  updateItemResults(
    runId: string,
    items: ItemResultInput[],
    client?: DbClient,
  ): Promise<ChecklistRunItemRow[]>;
  complete(
    id: string,
    businessId: string,
    status: ChecklistRunStatus,
    observations: string | undefined,
    client?: DbClient,
  ): Promise<ChecklistRunRow | null>;
}

export const CHECKLIST_RUNS_REPOSITORY = Symbol('CHECKLIST_RUNS_REPOSITORY');
