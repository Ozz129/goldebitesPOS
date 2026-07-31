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
import { CreateInventoryItemCategoryDto } from '../dto/create-inventory-item-category.dto';
import { InventoryItemCategoryQueryDto } from '../dto/inventory-item-category-query.dto';
import { SetInventoryItemCategoryStatusDto } from '../dto/set-inventory-item-category-status.dto';
import { UpdateInventoryItemCategoryDto } from '../dto/update-inventory-item-category.dto';
import { InventoryItemCategoriesService } from '../services/inventory-item-categories.service';

@ApiTags('Inventory Item Categories')
@ApiBearerAuth()
@Controller('inventory-item-categories')
export class InventoryItemCategoriesController {
  constructor(
    private readonly categoriesService: InventoryItemCategoriesService,
  ) {}

  @Post()
  @Permissions('inventory.manage')
  @ApiOperation({ summary: 'Create an inventory item category' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateInventoryItemCategoryDto,
  ) {
    return this.categoriesService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('inventory.read')
  @ApiOperation({
    summary: 'List inventory item categories for the current business',
  })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: InventoryItemCategoryQueryDto,
  ) {
    return this.categoriesService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      isActive: query.isActive,
      search: query.search,
    });
  }

  @Get(':id')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'Get a single inventory item category' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.categoriesService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('inventory.manage')
  @ApiOperation({
    summary:
      'Update an inventory item category (name, description, display order)',
  })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemCategoryDto,
  ) {
    return this.categoriesService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('inventory.manage')
  @ApiOperation({
    summary: 'Activate or deactivate an inventory item category',
  })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetInventoryItemCategoryStatusDto,
  ) {
    return this.categoriesService.setActive(
      businessId,
      id,
      dto.isActive,
      actorUserId,
    );
  }
}
