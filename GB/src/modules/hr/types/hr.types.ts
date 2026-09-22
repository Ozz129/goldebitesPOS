export interface BranchRule {
  id: string;
  businessId: string;
  branchId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BranchRuleInput {
  title: string;
  description?: string;
}

export interface HrProfile {
  role: {
    name: string;
    description: string | null;
  };
  branchRules: BranchRule[];
}
