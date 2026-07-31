export type ChecklistType = 'OPENING' | 'CLOSING';
export type ChecklistRunStatus = 'IN_PROGRESS' | 'COMPLETED' | 'INCOMPLETE';

export interface ChecklistTemplateItem {
  id: string;
  templateId: string;
  label: string;
  displayOrder: number;
}

export interface ChecklistTemplate {
  id: string;
  businessId: string;
  type: ChecklistType;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplateWithItems extends ChecklistTemplate {
  items: ChecklistTemplateItem[];
}

export interface TemplateItemInput {
  label: string;
}

export interface CreateChecklistTemplatePayload {
  type: ChecklistType;
  name: string;
  items: TemplateItemInput[];
}

export interface UpdateChecklistTemplatePayload {
  type?: ChecklistType;
  name?: string;
}

export interface ChecklistTemplateFilters {
  page?: number;
  limit?: number;
  type?: ChecklistType;
  isActive?: boolean;
}

export interface ChecklistRunItem {
  id: string;
  runId: string;
  templateItemId: string | null;
  label: string;
  checked: boolean;
  displayOrder: number;
}

export interface ChecklistRun {
  id: string;
  businessId: string;
  branchId: string;
  templateId: string;
  status: ChecklistRunStatus;
  startedBy: string | null;
  startedAt: string;
  completedAt: string | null;
  observations: string | null;
}

export interface ChecklistRunWithItems extends ChecklistRun {
  items: ChecklistRunItem[];
}

export interface StartChecklistRunPayload {
  branchId: string;
  templateId: string;
}

export interface ItemResultInput {
  id: string;
  checked: boolean;
}

export interface ChecklistRunFilters {
  page?: number;
  limit?: number;
  templateId?: string;
  branchId?: string;
  status?: ChecklistRunStatus;
}
