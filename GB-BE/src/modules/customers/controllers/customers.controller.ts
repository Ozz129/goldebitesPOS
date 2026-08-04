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
import { CreateCustomerAddressDto } from '../dto/create-customer-address.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerQueryDto } from '../dto/customer-query.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomersService } from '../services/customers.service';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@RequiresFeature('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Permissions('orders.create')
  @ApiOperation({ summary: 'Create a customer' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('orders.read')
  @ApiOperation({ summary: 'List customers, searchable by name/phone/email' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: CustomerQueryDto,
  ) {
    return this.customersService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  @Get(':id')
  @Permissions('orders.read')
  @ApiOperation({ summary: 'Get a single customer' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.customersService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Update a customer' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(businessId, id, dto, actorUserId);
  }

  @Delete(':id')
  @Permissions('orders.update')
  @RawResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a customer' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.customersService.softDelete(businessId, id, actorUserId);
  }

  @Post(':id/addresses')
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Add a saved delivery address for the customer' })
  addAddress(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: CreateCustomerAddressDto,
  ) {
    return this.customersService.addAddress(businessId, id, dto);
  }

  @Get(':id/addresses')
  @Permissions('orders.read')
  @ApiOperation({ summary: 'List the saved delivery addresses of a customer' })
  listAddresses(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.listAddresses(businessId, id);
  }

  @Delete(':id/addresses/:addressId')
  @Permissions('orders.update')
  @RawResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a saved delivery address' })
  async removeAddress(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    await this.customersService.removeAddress(businessId, id, addressId);
  }
}
