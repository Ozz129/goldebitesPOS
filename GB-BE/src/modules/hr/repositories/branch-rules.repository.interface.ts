import { DbClient } from '../../../database/types/database.types';
import { BranchRuleRow } from '../domain/branch-rule.interface';
import { BranchRuleInput } from '../domain/branch-rule.types';

export interface IBranchRulesRepository {
  findAllByBranch(businessId: string, branchId: string): Promise<BranchRuleRow[]>;
  replaceAll(
    businessId: string,
    branchId: string,
    items: BranchRuleInput[],
    client?: DbClient,
  ): Promise<BranchRuleRow[]>;
}

export const BRANCH_RULES_REPOSITORY = Symbol('BRANCH_RULES_REPOSITORY');
