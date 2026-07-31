import { DbClient } from '../../../database/types/database.types';
import {
  ChecklistTemplateItemRow,
  ChecklistTemplateRow,
} from '../domain/checklist.interface';
import {
  ChecklistTemplateQuery,
  CreateChecklistTemplateData,
  TemplateItemInput,
  UpdateChecklistTemplateData,
} from '../domain/checklist.types';

export interface IChecklistTemplatesRepository {
  create(
    data: CreateChecklistTemplateData,
    client?: DbClient,
  ): Promise<ChecklistTemplateRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ChecklistTemplateRow | null>;
  findAll(
    query: ChecklistTemplateQuery,
  ): Promise<{ rows: ChecklistTemplateRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateChecklistTemplateData,
    client?: DbClient,
  ): Promise<ChecklistTemplateRow | null>;
  setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<ChecklistTemplateRow | null>;
  softDelete(
    id: string,
    businessId: string,
  ): Promise<ChecklistTemplateRow | null>;
  findItems(
    templateId: string,
    client?: DbClient,
  ): Promise<ChecklistTemplateItemRow[]>;
  addItems(
    templateId: string,
    items: TemplateItemInput[],
    client?: DbClient,
  ): Promise<ChecklistTemplateItemRow[]>;
  replaceItems(
    templateId: string,
    items: TemplateItemInput[],
    client?: DbClient,
  ): Promise<ChecklistTemplateItemRow[]>;
}

export const CHECKLIST_TEMPLATES_REPOSITORY = Symbol(
  'CHECKLIST_TEMPLATES_REPOSITORY',
);
