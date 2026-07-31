import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentsService } from '../services/payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('orders/:orderId/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Register a payment against an order' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(
      businessId,
      { orderId, ...dto },
      actorUserId,
    );
  }

  @Get()
  @Permissions('orders.read')
  @ApiOperation({ summary: 'List payments registered for an order' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.findByOrder(businessId, orderId);
  }
}
