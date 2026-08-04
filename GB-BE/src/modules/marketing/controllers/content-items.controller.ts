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
import { ContentItemQueryDto } from '../dto/content-item-query.dto';
import { CreateContentItemDto } from '../dto/create-content-item.dto';
import { UpdateContentItemDto } from '../dto/update-content-item.dto';
import { ContentItemsService } from '../services/content-items.service';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';

@ApiTags('Marketing')
@ApiBearerAuth()
@RequiresFeature('marketing')
@Controller('marketing-content-items')
export class ContentItemsController {
  constructor(private readonly contentItemsService: ContentItemsService) {}

  @Post()
  @Permissions('marketing.manage')
  @ApiOperation({ summary: 'Schedule a content calendar item' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateContentItemDto,
  ) {
    return this.contentItemsService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('marketing.read')
  @ApiOperation({ summary: 'List content calendar items' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: ContentItemQueryDto,
  ) {
    return this.contentItemsService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      status: query.status,
      channel: query.channel,
    });
  }

  @Patch(':id')
  @Permissions('marketing.manage')
  @ApiOperation({ summary: 'Update a content calendar item' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContentItemDto,
  ) {
    return this.contentItemsService.update(businessId, id, dto, actorUserId);
  }

  @Delete(':id')
  @Permissions('marketing.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete a content calendar item' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.contentItemsService.softDelete(businessId, id, actorUserId);
  }
}
