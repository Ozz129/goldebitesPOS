import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RawResponse } from '../../../common/decorators/raw-response.decorator';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { RewardQueryDto } from '../dto/reward-query.dto';
import { SetRewardStatusDto } from '../dto/set-reward-status.dto';
import { UpdateRewardDto } from '../dto/update-reward.dto';
import { LoyaltyRewardsService } from '../services/loyalty-rewards.service';

@ApiTags('Loyalty')
@ApiBearerAuth()
@Controller('loyalty-rewards')
export class LoyaltyRewardsController {
  constructor(private readonly rewardsService: LoyaltyRewardsService) {}

  @Post()
  @Permissions('loyalty.manage')
  @ApiOperation({ summary: 'Create a loyalty reward' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateRewardDto,
  ) {
    return this.rewardsService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('loyalty.read')
  @ApiOperation({ summary: 'List loyalty rewards for the current business' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: RewardQueryDto,
  ) {
    return this.rewardsService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      isActive: query.isActive,
    });
  }

  @Patch(':id')
  @Permissions('loyalty.manage')
  @ApiOperation({ summary: 'Update a loyalty reward' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRewardDto,
  ) {
    return this.rewardsService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('loyalty.manage')
  @ApiOperation({ summary: 'Activate or deactivate a loyalty reward' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetRewardStatusDto,
  ) {
    return this.rewardsService.setActive(
      businessId,
      id,
      dto.isActive,
      actorUserId,
    );
  }

  @Delete(':id')
  @Permissions('loyalty.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete a loyalty reward' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.rewardsService.softDelete(businessId, id, actorUserId);
  }
}
