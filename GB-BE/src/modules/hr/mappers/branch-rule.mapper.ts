import { BranchRule, BranchRuleRow } from '../domain/branch-rule.interface';

export class BranchRuleMapper {
  static toDomain(row: BranchRuleRow): BranchRule {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      title: row.title,
      description: row.description,
      displayOrder: row.display_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
