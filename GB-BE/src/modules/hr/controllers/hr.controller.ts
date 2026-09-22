import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';
import { BranchRuleQueryDto } from '../dto/branch-rule-query.dto';
import { SetBranchRulesDto } from '../dto/set-branch-rules.dto';
import { BranchRulesService } from '../services/branch-rules.service';
import { HrProfileService } from '../services/hr-profile.service';

@ApiTags('HR')
@ApiBearerAuth()
@Controller('hr')
@RequiresFeature('hr')
export class HrController {
  constructor(
    private readonly branchRulesService: BranchRulesService,
    private readonly hrProfileService: HrProfileService,
  ) {}

  @Get('branch-rules')
  @Permissions('hr.manage')
  @ApiOperation({ summary: "List a branch's HR rules/norms" })
  findAllByBranch(@CurrentBusiness() businessId: string, @Query() query: BranchRuleQueryDto) {
    return this.branchRulesService.findAllByBranch(businessId, query.branchId);
  }

  @Put('branch-rules')
  @Permissions('hr.manage')
  @ApiOperation({ summary: "Replace a branch's full list of HR rules/norms" })
  replaceAll(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Query() query: BranchRuleQueryDto,
    @Body() dto: SetBranchRulesDto,
  ) {
    return this.branchRulesService.replaceAll(businessId, query.branchId, dto.rules, actorUserId);
  }

  @Get('my-profile')
  @ApiOperation({ summary: "Get the current user's own role description and branch rules" })
  getMyProfile(
    @CurrentBusiness() businessId: string,
    @CurrentUser('roleId') roleId: string,
    @CurrentUser('branchId') branchId: string | null,
  ) {
    return this.hrProfileService.getMyProfile(businessId, roleId, branchId);
  }
}
