import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';
import { RunInventoryQueryDto } from '../dto/run-inventory-query.dto';
import { InventoryQueriesService } from '../services/inventory-queries.service';

@ApiTags('Inventory Queries')
@ApiBearerAuth()
@RequiresFeature('inventory.specializedQueries')
@Controller('inventory-items')
export class InventoryQueriesController {
  constructor(private readonly inventoryQueriesService: InventoryQueriesService) {}

  @Post('query')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'Consultas especializadas — run an ad-hoc, multi-condition inventory filter' })
  run(@CurrentBusiness() businessId: string, @Body() dto: RunInventoryQueryDto) {
    return this.inventoryQueriesService.run({
      businessId,
      branchId: dto.branchId,
      conditions: dto.conditions,
      intent: dto.intent,
      page: dto.page,
      limit: dto.limit,
    });
  }
}
