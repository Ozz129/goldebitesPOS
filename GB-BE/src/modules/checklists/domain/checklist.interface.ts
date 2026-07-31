import { ChecklistRunStatus, ChecklistType } from './checklist.types';

export interface ChecklistTemplate {
  id: string;
  businessId: string;
  type: ChecklistType;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistTemplateRow {
  id: string;
  business_id: string;
  type: ChecklistType;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ChecklistTemplateItem {
  id: string;
  templateId: string;
  label: string;
  displayOrder: number;
}

export interface ChecklistTemplateItemRow {
  id: string;
  template_id: string;
  label: string;
  display_order: number;
}

export interface ChecklistTemplateWithItems extends ChecklistTemplate {
  items: ChecklistTemplateItem[];
}

export interface ChecklistRun {
  id: string;
  businessId: string;
  branchId: string;
  templateId: string;
  status: ChecklistRunStatus;
  startedBy: string | null;
  startedAt: Date;
  completedAt: Date | null;
  observations: string | null;
}

export interface ChecklistRunRow {
  id: string;
  business_id: string;
  branch_id: string;
  template_id: string;
  status: ChecklistRunStatus;
  started_by: string | null;
  started_at: Date;
  completed_at: Date | null;
  observations: string | null;
}

export interface ChecklistRunItem {
  id: string;
  runId: string;
  templateItemId: string | null;
  label: string;
  checked: boolean;
  displayOrder: number;
}

export interface ChecklistRunItemRow {
  id: string;
  run_id: string;
  template_item_id: string | null;
  label_snapshot: string;
  checked: boolean;
  display_order: number;
}

export interface ChecklistRunWithItems extends ChecklistRun {
  items: ChecklistRunItem[];
}
