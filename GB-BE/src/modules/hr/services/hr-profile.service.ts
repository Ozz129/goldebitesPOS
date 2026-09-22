import { Inject, Injectable } from '@nestjs/common';
import { RolesService } from '../../roles/services/roles.service';
import { HrProfile } from '../domain/branch-rule.types';
import { BranchRuleMapper } from '../mappers/branch-rule.mapper';
import { BRANCH_RULES_REPOSITORY } from '../repositories/branch-rules.repository.interface';
import type { IBranchRulesRepository } from '../repositories/branch-rules.repository.interface';

@Injectable()
export class HrProfileService {
  constructor(
    @Inject(BRANCH_RULES_REPOSITORY)
    private readonly branchRulesRepository: IBranchRulesRepository,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * The caller (roleId/branchId) comes straight from the JWT, already scoped
   * to this business — no extra ownership check needed, same "lean lookup"
   * reasoning as TableNamesService.findName().
   */
  async getMyProfile(businessId: string, roleId: string, branchId: string | null): Promise<HrProfile> {
    const role = await this.rolesService.findOne(businessId, roleId);
    const rows = branchId
      ? await this.branchRulesRepository.findAllByBranch(businessId, branchId)
      : [];

    return {
      role: { name: role.name, description: role.description },
      branchRules: rows.map((row) => BranchRuleMapper.toDomain(row)),
    };
  }
}
