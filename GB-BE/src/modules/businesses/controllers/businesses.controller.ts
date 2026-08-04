import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { SetBusinessStatusDto } from '../dto/set-business-status.dto';
import { UpdateBusinessDto } from '../dto/update-business.dto';
import { BusinessesService } from '../services/businesses.service';

@ApiTags('Businesses')
@ApiBearerAuth()
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the current user's business" })
  findMine(@CurrentBusiness() businessId: string) {
    return this.businessesService.findById(businessId);
  }

  @Patch('me')
  @Permissions('businesses.manage')
  @ApiOperation({ summary: "Update the current user's business" })
  updateMine(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessesService.update(businessId, dto, actorUserId);
  }

  @Patch('me/status')
  @Permissions('businesses.manage')
  @ApiOperation({
    summary: "Activate or deactivate the current user's business",
  })
  setMyStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: SetBusinessStatusDto,
  ) {
    return this.businessesService.setActive(
      businessId,
      dto.isActive,
      actorUserId,
    );
  }
}
