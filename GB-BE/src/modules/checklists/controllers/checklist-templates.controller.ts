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
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RawResponse } from '../../../common/decorators/raw-response.decorator';
import { ChecklistTemplateQueryDto } from '../dto/checklist-template-query.dto';
import { CreateChecklistTemplateDto } from '../dto/create-checklist-template.dto';
import { SetChecklistTemplateItemsDto } from '../dto/set-checklist-template-items.dto';
import { SetChecklistTemplateStatusDto } from '../dto/set-checklist-template-status.dto';
import { UpdateChecklistTemplateDto } from '../dto/update-checklist-template.dto';
import { ChecklistTemplatesService } from '../services/checklist-templates.service';

@ApiTags('Checklists')
@ApiBearerAuth()
@Controller('checklist-templates')
export class ChecklistTemplatesController {
  constructor(private readonly templatesService: ChecklistTemplatesService) {}

  @Post()
  @Permissions('checklists.manage')
  @ApiOperation({ summary: 'Create a checklist template with its items' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateChecklistTemplateDto,
  ) {
    const { items, ...rest } = dto;
    return this.templatesService.create(
      { businessId, ...rest },
      items,
      actorUserId,
    );
  }

  @Get()
  @Permissions('checklists.read')
  @ApiOperation({
    summary: 'List checklist templates for the current business',
  })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: ChecklistTemplateQueryDto,
  ) {
    return this.templatesService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      type: query.type,
      isActive: query.isActive,
    });
  }

  @Get(':id')
  @Permissions('checklists.read')
  @ApiOperation({ summary: 'Get a checklist template with its items' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.templatesService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('checklists.manage')
  @ApiOperation({ summary: 'Update a checklist template name/type' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateChecklistTemplateDto,
  ) {
    return this.templatesService.update(businessId, id, dto, actorUserId);
  }

  @Put(':id/items')
  @Permissions('checklists.manage')
  @ApiOperation({ summary: 'Replace a checklist template items' })
  replaceItems(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetChecklistTemplateItemsDto,
  ) {
    return this.templatesService.replaceItems(
      businessId,
      id,
      dto.items,
      actorUserId,
    );
  }

  @Patch(':id/status')
  @Permissions('checklists.manage')
  @ApiOperation({ summary: 'Activate or deactivate a checklist template' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetChecklistTemplateStatusDto,
  ) {
    return this.templatesService.setActive(
      businessId,
      id,
      dto.isActive,
      actorUserId,
    );
  }

  @Delete(':id')
  @Permissions('checklists.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete a checklist template' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.templatesService.softDelete(businessId, id, actorUserId);
  }
}
