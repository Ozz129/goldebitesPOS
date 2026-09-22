import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { RolesModule } from '../roles/roles.module';
import { HrController } from './controllers/hr.controller';
import { BranchRulesRepository } from './repositories/branch-rules.repository';
import { BRANCH_RULES_REPOSITORY } from './repositories/branch-rules.repository.interface';
import { BranchRulesService } from './services/branch-rules.service';
import { HrProfileService } from './services/hr-profile.service';

@Module({
  imports: [AuditModule, BranchesModule, RolesModule],
  controllers: [HrController],
  providers: [
    BranchRulesService,
    HrProfileService,
    { provide: BRANCH_RULES_REPOSITORY, useClass: BranchRulesRepository },
  ],
  exports: [BranchRulesService],
})
export class HrModule {}
