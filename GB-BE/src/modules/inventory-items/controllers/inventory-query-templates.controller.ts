import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RawResponse } from '../../../common/decorators/raw-response.decorator';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';
import { CreateInventoryQueryTemplateDto } from '../dto/create-inventory-query-template.dto';
import { RunInventoryQueryTemplateDto } from '../dto/run-inventory-query-template.dto';
import { InventoryQueriesService } from '../services/inventory-queries.service';

@ApiTags('Inventory Queries')
@ApiBearerAuth()
@RequiresFeature('inventory')
@Controller('inventory-query-templates')
export class InventoryQueryTemplatesController {
  constructor(private readonly inventoryQueriesService: InventoryQueriesService) {}

  @Get()
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'List saved "consultas especializadas" templates for the business' })
  findAll(@CurrentBusiness() businessId: string) {
    return this.inventoryQueriesService.listTemplates(businessId);
  }

  @Post()
  @Permissions('inventory.manage')
  @ApiOperation({ summary: 'Save the current condition set as a reusable named template' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateInventoryQueryTemplateDto,
  ) {
    return this.inventoryQueriesService.createTemplate(
      { businessId, name: dto.name, conditions: dto.conditions },
      actorUserId,
    );
  }

  @Post(':id/run')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'Run a saved template — its conditions are re-validated every time' })
  run(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: RunInventoryQueryTemplateDto,
  ) {
    return this.inventoryQueriesService.runTemplate(businessId, id, dto.branchId, dto.page, dto.limit);
  }

  @Delete(':id')
  @Permissions('inventory.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Delete a saved template' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.inventoryQueriesService.deleteTemplate(businessId, id, actorUserId);
  }
}
