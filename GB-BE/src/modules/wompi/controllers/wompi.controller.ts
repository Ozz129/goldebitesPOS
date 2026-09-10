import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ConfirmWompiTransactionDto } from '../dto/confirm-wompi-transaction.dto';
import { CreateWompiIntentDto } from '../dto/create-wompi-intent.dto';
import { WompiEnabledGuard } from '../guards/wompi-enabled.guard';
import { WompiService } from '../services/wompi.service';

@ApiTags('Wompi')
@ApiBearerAuth()
@UseGuards(WompiEnabledGuard)
@Controller('orders/:orderId/wompi-payments')
export class WompiController {
  constructor(private readonly wompiService: WompiService) {}

  @Post()
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Start a Wompi checkout for an order\'s pending balance' })
  createIntent(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CreateWompiIntentDto,
  ) {
    return this.wompiService.createIntent(businessId, orderId, dto.payerLabel, actorUserId);
  }

  @Post('qr')
  @Permissions('orders.update')
  @ApiOperation({
    summary: 'Start a Bancolombia QR checkout — customer scans and pays from their own bank app',
  })
  createQrCheckout(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CreateWompiIntentDto,
  ) {
    return this.wompiService.createQrCheckout(businessId, orderId, dto.payerLabel, actorUserId);
  }

  @Post(':reference/confirm')
  @Permissions('orders.update')
  @ApiOperation({
    summary: 'Confirm a Wompi transaction against its intent and register the resulting payment',
  })
  confirmTransaction(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('orderId') orderId: string,
    @Param('reference') reference: string,
    @Body() dto: ConfirmWompiTransactionDto,
  ) {
    return this.wompiService.confirmTransaction(
      businessId,
      orderId,
      reference,
      dto.wompiTransactionId,
      actorUserId,
    );
  }
}
