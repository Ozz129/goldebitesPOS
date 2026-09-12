import { Body, Controller, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/app.config';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { SimulateBankTransactionDto } from '../dto/simulate-bank-transaction.dto';
import { BankVerificationEnabledGuard } from '../guards/bank-verification-enabled.guard';
import { MockBankTransactionProvider } from '../providers/mock-bank-transaction-provider';
import { BankTransactionIngestionService } from '../services/bank-transaction-ingestion.service';

/**
 * Dev-only: lets you simulate a Bancolombia transfer without a real email, so the whole
 * WAITING -> MATCHED flow can be exercised locally. Hard-blocked outside development —
 * see the NODE_ENV check below, which fires regardless of how BANK_VERIFICATION_PROVIDER
 * is set, so this can never come alive in production by accident.
 */
@ApiTags('Bank Transfer Verification (dev)')
@ApiBearerAuth()
@UseGuards(BankVerificationEnabledGuard)
@Controller('dev/bank-transactions')
export class DevBankTransactionsController {
  constructor(
    private readonly mockProvider: MockBankTransactionProvider,
    private readonly ingestionService: BankTransactionIngestionService,
    private readonly configService: ConfigService,
  ) {}

  @Post('simulate')
  @Permissions('orders.update')
  @ApiOperation({ summary: 'DEV ONLY — simulate an incoming Bancolombia transfer and run matching immediately' })
  async simulate(@Body() dto: SimulateBankTransactionDto) {
    if (this.configService.getOrThrow<AppConfig>('app').nodeEnv === 'production') {
      throw new NotFoundException('Route not found');
    }

    this.mockProvider.simulate({
      amount: dto.amount,
      reference: dto.reference,
      receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : undefined,
    });
    await this.ingestionService.runIngestionTick();
    return { simulated: true };
  }
}
