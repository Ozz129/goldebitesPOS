import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ConfirmBankTransferManualDto } from '../dto/confirm-bank-transfer-manual.dto';
import { BankVerificationEnabledGuard } from '../guards/bank-verification-enabled.guard';
import { BankTransferRequestsService } from '../services/bank-transfer-requests.service';

@ApiTags('Bank Transfer Verification')
@ApiBearerAuth()
@UseGuards(BankVerificationEnabledGuard)
@Controller('orders/:orderId/bank-transfer')
export class BankTransferController {
  constructor(private readonly requestsService: BankTransferRequestsService) {}

  @Post('start')
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Start waiting for a Bancolombia transfer for this order\'s pending balance' })
  start(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.requestsService.start(businessId, orderId, actorUserId);
  }

  @Get('status')
  @Permissions('orders.read')
  @ApiOperation({ summary: 'Poll the current bank transfer verification status for this order' })
  getStatus(@CurrentBusiness() businessId: string, @Param('orderId') orderId: string) {
    return this.requestsService.getStatus(businessId, orderId);
  }

  @Post('recheck')
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Verificar nuevamente — check for new bank transactions right now' })
  recheck(@CurrentBusiness() businessId: string, @Param('orderId') orderId: string) {
    return this.requestsService.recheck(businessId, orderId);
  }

  @Post('cancel')
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Abandon waiting for a bank transfer and go back to manual payment entry' })
  cancel(@CurrentBusiness() businessId: string, @Param('orderId') orderId: string) {
    return this.requestsService.cancel(businessId, orderId);
  }

  @Post('confirm-manual')
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Revisión manual — cashier picks the correct transaction among ambiguous candidates' })
  confirmManual(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('orderId') orderId: string,
    @Body() dto: ConfirmBankTransferManualDto,
  ) {
    return this.requestsService.confirmManual(businessId, orderId, dto.transactionId, actorUserId);
  }
}
