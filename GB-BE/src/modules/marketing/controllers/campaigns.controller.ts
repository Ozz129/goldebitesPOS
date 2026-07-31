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
import { CampaignQueryDto } from '../dto/campaign-query.dto';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import { CampaignsService } from '../services/campaigns.service';

@ApiTags('Marketing')
@ApiBearerAuth()
@Controller('marketing-campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Permissions('marketing.manage')
  @ApiOperation({ summary: 'Create a marketing campaign' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('marketing.read')
  @ApiOperation({ summary: 'List marketing campaigns' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: CampaignQueryDto,
  ) {
    return this.campaignsService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      status: query.status,
      channel: query.channel,
    });
  }

  @Patch(':id')
  @Permissions('marketing.manage')
  @ApiOperation({ summary: 'Update a marketing campaign' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(businessId, id, dto, actorUserId);
  }

  @Delete(':id')
  @Permissions('marketing.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete a marketing campaign' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.campaignsService.softDelete(businessId, id, actorUserId);
  }
}
