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
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';
import { CreateSideDto } from '../dto/create-side.dto';
import { SideQueryDto } from '../dto/side-query.dto';
import { SetSideStatusDto } from '../dto/set-side-status.dto';
import { UpdateSideDto } from '../dto/update-side.dto';
import { SidesService } from '../services/sides.service';

@ApiTags('Sides')
@ApiBearerAuth()
@RequiresFeature('products')
@Controller('sides')
export class SidesController {
  constructor(private readonly sidesService: SidesService) {}

  @Post()
  @Permissions('products.create')
  @ApiOperation({ summary: 'Create a side' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateSideDto,
  ) {
    return this.sidesService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('products.read')
  @ApiOperation({ summary: 'List sides for the current business' })
  findAll(@CurrentBusiness() businessId: string, @Query() query: SideQueryDto) {
    return this.sidesService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      isActive: query.isActive,
      search: query.search,
    });
  }

  @Get(':id')
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get a single side' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.sidesService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('products.update')
  @ApiOperation({ summary: 'Update a side (name, description, display order)' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSideDto,
  ) {
    return this.sidesService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('products.update')
  @ApiOperation({ summary: 'Activate or deactivate a side' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetSideStatusDto,
  ) {
    return this.sidesService.setActive(
      businessId,
      id,
      dto.isActive,
      actorUserId,
    );
  }
}
