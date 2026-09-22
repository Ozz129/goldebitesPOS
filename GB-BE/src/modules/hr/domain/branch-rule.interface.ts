export interface BranchRule {
  id: string;
  businessId: string;
  branchId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchRuleRow {
  id: string;
  business_id: string;
  branch_id: string;
  title: string;
  description: string | null;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}
