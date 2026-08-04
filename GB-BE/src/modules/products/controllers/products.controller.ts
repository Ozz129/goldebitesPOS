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
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { SetProductStatusDto } from '../dto/set-product-status.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductsService } from '../services/products.service';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@RequiresFeature('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions('products.create')
  @ApiOperation({ summary: 'Create a product' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('products.read')
  @ApiOperation({ summary: 'List products for the current business' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: ProductQueryDto,
  ) {
    return this.productsService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      categoryId: query.categoryId,
      isActive: query.isActive,
      search: query.search,
    });
  }

  @Get('available')
  @Permissions('products.read')
  @ApiOperation({
    summary: 'List products available for sale (active, not deleted)',
  })
  findAvailableForSale(@CurrentBusiness() businessId: string) {
    return this.productsService.findAvailableForSale(businessId);
  }

  @Get(':id')
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get a single product' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.productsService.findOne(businessId, id);
  }

  @Get(':id/margin')
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get the sale price / cost margin for a product' })
  getMargin(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.productsService.getMargin(businessId, id);
  }

  @Patch(':id')
  @Permissions('products.update')
  @ApiOperation({ summary: 'Update a product' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('products.update')
  @ApiOperation({ summary: 'Activate or deactivate a product' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetProductStatusDto,
  ) {
    return this.productsService.setActive(
      businessId,
      id,
      dto.isActive,
      actorUserId,
    );
  }

  @Delete(':id')
  @Permissions('products.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete a product' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.productsService.softDelete(businessId, id, actorUserId);
  }
}
