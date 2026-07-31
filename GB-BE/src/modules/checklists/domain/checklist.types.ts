export enum ChecklistType {
  OPENING = 'OPENING',
  CLOSING = 'CLOSING',
}

export enum ChecklistRunStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
}

export interface TemplateItemInput {
  label: string;
}

export interface CreateChecklistTemplateData {
  businessId: string;
  type: ChecklistType;
  name: string;
}

export interface UpdateChecklistTemplateData {
  type?: ChecklistType;
  name?: string;
}

export interface ChecklistTemplateQuery {
  businessId: string;
  page: number;
  limit: number;
  type?: ChecklistType;
  isActive?: boolean;
}

export interface StartChecklistRunData {
  businessId: string;
  branchId: string;
  templateId: string;
}

export interface ItemResultInput {
  id: string;
  checked: boolean;
}

export interface ChecklistRunQuery {
  businessId: string;
  page: number;
  limit: number;
  templateId?: string;
  branchId?: string;
  status?: ChecklistRunStatus;
}
