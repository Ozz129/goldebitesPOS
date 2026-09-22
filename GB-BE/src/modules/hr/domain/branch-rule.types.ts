import { BranchRule } from './branch-rule.interface';

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
