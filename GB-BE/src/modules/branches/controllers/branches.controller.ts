import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { BranchQueryDto } from '../dto/branch-query.dto';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { SetBranchStatusDto } from '../dto/set-branch-status.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { BranchesService } from '../services/branches.service';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Permissions('branches.manage')
  @ApiOperation({ summary: 'Create a branch for the current business' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateBranchDto,
  ) {
    return this.branchesService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @ApiOperation({ summary: 'List branches for the current business' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: BranchQueryDto,
  ) {
    return this.branchesService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      isActive: query.isActive,
      search: query.search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single branch' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.branchesService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('branches.manage')
  @ApiOperation({ summary: 'Update a branch' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('branches.manage')
  @ApiOperation({ summary: 'Activate or deactivate a branch' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetBranchStatusDto,
  ) {
    return this.branchesService.setActive(
      businessId,
      id,
      dto.isActive,
      actorUserId,
    );
  }
}
