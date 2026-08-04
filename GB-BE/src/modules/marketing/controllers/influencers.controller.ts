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
import { CreateInfluencerDto } from '../dto/create-influencer.dto';
import { InfluencerQueryDto } from '../dto/influencer-query.dto';
import { UpdateInfluencerDto } from '../dto/update-influencer.dto';
import { InfluencersService } from '../services/influencers.service';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';

@ApiTags('Marketing')
@ApiBearerAuth()
@RequiresFeature('marketing')
@Controller('marketing-influencers')
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Post()
  @Permissions('marketing.manage')
  @ApiOperation({ summary: 'Add an influencer to the tracking list' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateInfluencerDto,
  ) {
    return this.influencersService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('marketing.read')
  @ApiOperation({ summary: 'List tracked influencers' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: InfluencerQueryDto,
  ) {
    return this.influencersService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      status: query.status,
    });
  }

  @Patch(':id')
  @Permissions('marketing.manage')
  @ApiOperation({ summary: 'Update an influencer' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInfluencerDto,
  ) {
    return this.influencersService.update(businessId, id, dto, actorUserId);
  }

  @Delete(':id')
  @Permissions('marketing.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Remove an influencer from the tracking list' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.influencersService.softDelete(businessId, id, actorUserId);
  }
}
