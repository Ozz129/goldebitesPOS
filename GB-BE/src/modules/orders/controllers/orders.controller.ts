import {
  Body,
  Controller,
  Get,
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
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { ReplaceOrderItemsDto } from '../dto/replace-order-items.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrdersService } from '../services/orders.service';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@RequiresFeature('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Permissions('orders.create')
  @ApiOperation({ summary: 'Create an order in PENDING status' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateOrderDto,
  ) {
    const { items, ...rest } = dto;
    return this.ordersService.create(
      { businessId, ...rest },
      items,
      actorUserId,
    );
  }

  @Get()
  @Permissions('orders.read')
  @ApiOperation({ summary: 'List orders' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      branchId: query.branchId,
      status: query.status,
      orderType: query.orderType,
      customerId: query.customerId,
      createdBy: query.createdBy,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }

  @Get(':id')
  @Permissions('orders.read')
  @ApiOperation({ summary: 'Get an order with its items' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.ordersService.findOne(businessId, id);
  }

  @Put(':id/items')
  @Permissions('orders.update')
  @ApiOperation({
    summary: 'Replace the items of a PENDING order and recompute totals',
  })
  replaceItems(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: ReplaceOrderItemsDto,
  ) {
    return this.ordersService.replaceItems(
      businessId,
      id,
      dto.items,
      actorUserId,
    );
  }

  @Patch(':id/status')
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Transition the order status' })
  updateStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      businessId,
      id,
      dto.status,
      actorUserId,
      dto.notes,
    );
  }
}
