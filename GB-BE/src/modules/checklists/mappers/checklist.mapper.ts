import {
  ChecklistRun,
  ChecklistRunItem,
  ChecklistRunItemRow,
  ChecklistRunRow,
  ChecklistTemplate,
  ChecklistTemplateItem,
  ChecklistTemplateItemRow,
  ChecklistTemplateRow,
} from '../domain/checklist.interface';

export class ChecklistMapper {
  static templateToDomain(row: ChecklistTemplateRow): ChecklistTemplate {
    return {
      id: row.id,
      businessId: row.business_id,
      type: row.type,
      name: row.name,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static templateItemToDomain(
    row: ChecklistTemplateItemRow,
  ): ChecklistTemplateItem {
    return {
      id: row.id,
      templateId: row.template_id,
      label: row.label,
      displayOrder: row.display_order,
    };
  }

  static runToDomain(row: ChecklistRunRow): ChecklistRun {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      templateId: row.template_id,
      status: row.status,
      startedBy: row.started_by,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      observations: row.observations,
    };
  }

  static runItemToDomain(row: ChecklistRunItemRow): ChecklistRunItem {
    return {
      id: row.id,
      runId: row.run_id,
      templateItemId: row.template_item_id,
      label: row.label_snapshot,
      checked: row.checked,
      displayOrder: row.display_order,
    };
  }
}
