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
import { CreateInventoryLocationDto } from '../dto/create-inventory-location.dto';
import { InventoryLocationQueryDto } from '../dto/inventory-location-query.dto';
import { SetInventoryLocationStatusDto } from '../dto/set-inventory-location-status.dto';
import { UpdateInventoryLocationDto } from '../dto/update-inventory-location.dto';
import { InventoryLocationsService } from '../services/inventory-locations.service';

@ApiTags('Inventory Locations')
@ApiBearerAuth()
@Controller('branches/:branchId/inventory-locations')
export class InventoryLocationsController {
  constructor(private readonly locationsService: InventoryLocationsService) {}

  @Post()
  @Permissions('inventory.manage')
  @ApiOperation({ summary: 'Create a storage location within a branch' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateInventoryLocationDto,
  ) {
    return this.locationsService.create(
      businessId,
      { branchId, ...dto },
      actorUserId,
    );
  }

  @Get()
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'List storage locations for a branch' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Param('branchId') branchId: string,
    @Query() query: InventoryLocationQueryDto,
  ) {
    return this.locationsService.findAll(businessId, {
      branchId,
      page: query.page,
      limit: query.limit,
      isActive: query.isActive,
    });
  }

  @Get(':id')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'Get a single storage location' })
  findOne(
    @CurrentBusiness() businessId: string,
    @Param('branchId') branchId: string,
    @Param('id') id: string,
  ) {
    return this.locationsService.findOne(businessId, branchId, id);
  }

  @Patch(':id')
  @Permissions('inventory.manage')
  @ApiOperation({ summary: 'Update a storage location' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryLocationDto,
  ) {
    return this.locationsService.update(
      businessId,
      branchId,
      id,
      dto,
      actorUserId,
    );
  }

  @Patch(':id/status')
  @Permissions('inventory.manage')
  @ApiOperation({ summary: 'Activate or deactivate a storage location' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body() dto: SetInventoryLocationStatusDto,
  ) {
    return this.locationsService.setActive(
      businessId,
      branchId,
      id,
      dto.isActive,
      actorUserId,
    );
  }
}
