import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { MovementQueryDto } from '../dto/movement-query.dto';
import { RedeemRewardDto } from '../dto/redeem-reward.dto';
import { UpdateLoyaltyConfigDto } from '../dto/update-loyalty-config.dto';
import { LoyaltyService } from '../services/loyalty.service';

@ApiTags('Loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('config')
  @Permissions('loyalty.read')
  @ApiOperation({ summary: 'Get the loyalty program configuration' })
  getConfig(@CurrentBusiness() businessId: string) {
    return this.loyaltyService.getConfig(businessId);
  }

  @Patch('config')
  @Permissions('loyalty.manage')
  @ApiOperation({ summary: 'Update the loyalty program configuration' })
  updateConfig(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: UpdateLoyaltyConfigDto,
  ) {
    return this.loyaltyService.updateConfig(businessId, dto, actorUserId);
  }

  @Get('movements')
  @Permissions('loyalty.read')
  @ApiOperation({ summary: 'List loyalty points movements (history)' })
  findMovements(
    @CurrentBusiness() businessId: string,
    @Query() query: MovementQueryDto,
  ) {
    return this.loyaltyService.findMovements({
      businessId,
      page: query.page,
      limit: query.limit,
      customerId: query.customerId,
      type: query.type,
    });
  }

  @Post('redemptions')
  @Permissions('loyalty.redeem')
  @ApiOperation({ summary: 'Redeem a reward on behalf of a customer' })
  redeem(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: RedeemRewardDto,
  ) {
    return this.loyaltyService.redeem(
      businessId,
      dto.customerId,
      dto.rewardId,
      actorUserId,
    );
  }
}
