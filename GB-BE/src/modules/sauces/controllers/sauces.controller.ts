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
import { CreateSauceDto } from '../dto/create-sauce.dto';
import { SauceQueryDto } from '../dto/sauce-query.dto';
import { SetSauceStatusDto } from '../dto/set-sauce-status.dto';
import { UpdateSauceDto } from '../dto/update-sauce.dto';
import { SaucesService } from '../services/sauces.service';

@ApiTags('Sauces')
@ApiBearerAuth()
@RequiresFeature('products')
@Controller('sauces')
export class SaucesController {
  constructor(private readonly saucesService: SaucesService) {}

  @Post()
  @Permissions('products.create')
  @ApiOperation({ summary: 'Create a sauce' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateSauceDto,
  ) {
    return this.saucesService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('products.read')
  @ApiOperation({ summary: 'List sauces for the current business' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: SauceQueryDto,
  ) {
    return this.saucesService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      isActive: query.isActive,
      search: query.search,
    });
  }

  @Get(':id')
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get a single sauce' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.saucesService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('products.update')
  @ApiOperation({
    summary: 'Update a sauce (name, description, display order)',
  })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSauceDto,
  ) {
    return this.saucesService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('products.update')
  @ApiOperation({ summary: 'Activate or deactivate a sauce' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetSauceStatusDto,
  ) {
    return this.saucesService.setActive(
      businessId,
      id,
      dto.isActive,
      actorUserId,
    );
  }
}
