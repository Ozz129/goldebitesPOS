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
import { CouponQueryDto } from '../dto/coupon-query.dto';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { SetCouponStatusDto } from '../dto/set-coupon-status.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { CouponsService } from '../services/coupons.service';

@ApiTags('Marketing')
@ApiBearerAuth()
@Controller('marketing-coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Permissions('marketing.manage')
  @ApiOperation({ summary: 'Create a marketing coupon' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateCouponDto,
  ) {
    return this.couponsService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('marketing.read')
  @ApiOperation({ summary: 'List marketing coupons' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: CouponQueryDto,
  ) {
    return this.couponsService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      isActive: query.isActive,
    });
  }

  @Patch(':id')
  @Permissions('marketing.manage')
  @ApiOperation({ summary: 'Update a marketing coupon' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('marketing.manage')
  @ApiOperation({ summary: 'Activate or deactivate a marketing coupon' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetCouponStatusDto,
  ) {
    return this.couponsService.setActive(
      businessId,
      id,
      dto.isActive,
      actorUserId,
    );
  }

  @Delete(':id')
  @Permissions('marketing.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete a marketing coupon' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.couponsService.softDelete(businessId, id, actorUserId);
  }
}
