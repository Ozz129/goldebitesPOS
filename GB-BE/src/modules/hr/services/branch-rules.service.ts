import { Inject, Injectable } from '@nestjs/common';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { BranchRule } from '../domain/branch-rule.interface';
import { BranchRuleInput } from '../domain/branch-rule.types';
import { BranchRuleMapper } from '../mappers/branch-rule.mapper';
import { BRANCH_RULES_REPOSITORY } from '../repositories/branch-rules.repository.interface';
import type { IBranchRulesRepository } from '../repositories/branch-rules.repository.interface';

@Injectable()
export class BranchRulesService {
  constructor(
    @Inject(BRANCH_RULES_REPOSITORY)
    private readonly branchRulesRepository: IBranchRulesRepository,
    private readonly branchesService: BranchesService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async findAllByBranch(businessId: string, branchId: string): Promise<BranchRule[]> {
    await this.branchesService.findOne(businessId, branchId);
    const rows = await this.branchRulesRepository.findAllByBranch(businessId, branchId);
    return rows.map((row) => BranchRuleMapper.toDomain(row));
  }

  async replaceAll(
    businessId: string,
    branchId: string,
    items: BranchRuleInput[],
    actorUserId?: string,
  ): Promise<BranchRule[]> {
    await this.branchesService.findOne(businessId, branchId);

    const rows = await this.transactionService.execute((client) =>
      this.branchRulesRepository.replaceAll(businessId, branchId, items, client),
    );

    await this.auditService.record({
      businessId,
      branchId,
      userId: actorUserId,
      entityType: 'branch_rules',
      entityId: branchId,
      action: 'SET',
      newValues: { count: items.length },
    });

    return rows.map((row) => BranchRuleMapper.toDomain(row));
  }
}
