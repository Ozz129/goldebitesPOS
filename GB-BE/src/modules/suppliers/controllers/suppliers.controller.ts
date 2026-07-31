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
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { SetSupplierStatusDto } from '../dto/set-supplier-status.dto';
import { SupplierQueryDto } from '../dto/supplier-query.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SuppliersService } from '../services/suppliers.service';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Permissions('suppliers.manage')
  @ApiOperation({ summary: 'Create a supplier' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.suppliersService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('suppliers.read')
  @ApiOperation({ summary: 'List suppliers for the current business' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: SupplierQueryDto,
  ) {
    return this.suppliersService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      isActive: query.isActive,
      search: query.search,
    });
  }

  @Get(':id')
  @Permissions('suppliers.read')
  @ApiOperation({ summary: 'Get a single supplier' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.suppliersService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('suppliers.manage')
  @ApiOperation({ summary: 'Update a supplier' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('suppliers.manage')
  @ApiOperation({ summary: 'Activate or deactivate a supplier' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetSupplierStatusDto,
  ) {
    return this.suppliersService.setActive(
      businessId,
      id,
      dto.isActive,
      actorUserId,
    );
  }
}
