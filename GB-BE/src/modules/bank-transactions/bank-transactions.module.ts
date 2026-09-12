import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { AuditModule } from '../audit/audit.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { BankTransferController } from './controllers/bank-transfer.controller';
import { DevBankTransactionsController } from './controllers/dev-bank-transactions.controller';
import { BankVerificationEnabledGuard } from './guards/bank-verification-enabled.guard';
import { BancolombiaEmailProvider } from './providers/bancolombia-email/bancolombia-email.provider';
import { BancolombiaNotificationParser } from './providers/bancolombia-email/bancolombia-notification.parser';
import { EMAIL_PROVIDER } from './providers/bancolombia-email/email-provider.interface';
import { GmailApiEmailProvider } from './providers/bancolombia-email/gmail-api-email.provider';
import { BANK_TRANSACTION_PROVIDER } from './providers/bank-transaction-provider.interface';
import { MockBankTransactionProvider } from './providers/mock-bank-transaction-provider';
import { BankTransactionsRepository } from './repositories/bank-transactions.repository';
import { BANK_TRANSACTIONS_REPOSITORY } from './repositories/bank-transactions.repository.interface';
import { BankTransferRequestsRepository } from './repositories/bank-transfer-requests.repository';
import { BANK_TRANSFER_REQUESTS_REPOSITORY } from './repositories/bank-transfer-requests.repository.interface';
import { BankTransactionIngestionService } from './services/bank-transaction-ingestion.service';
import { BankTransferRequestsService } from './services/bank-transfer-requests.service';
import { PaymentMatchingService } from './services/payment-matching.service';

@Module({
  imports: [OrdersModule, PaymentsModule, AuditModule],
  controllers: [BankTransferController, DevBankTransactionsController],
  providers: [
    { provide: BANK_TRANSACTIONS_REPOSITORY, useClass: BankTransactionsRepository },
    { provide: BANK_TRANSFER_REQUESTS_REPOSITORY, useClass: BankTransferRequestsRepository },
    { provide: EMAIL_PROVIDER, useClass: GmailApiEmailProvider },
    BancolombiaNotificationParser,
    BancolombiaEmailProvider,
    MockBankTransactionProvider,
    {
      provide: BANK_TRANSACTION_PROVIDER,
      inject: [ConfigService, MockBankTransactionProvider, BancolombiaEmailProvider],
      useFactory: (
        configService: ConfigService,
        mockProvider: MockBankTransactionProvider,
        emailProvider: BancolombiaEmailProvider,
      ) => {
        const appConfig = configService.getOrThrow<AppConfig>('app');
        if (appConfig.bankVerification.provider === 'mock') {
          if (appConfig.nodeEnv === 'production') {
            throw new Error(
              'BANK_VERIFICATION_PROVIDER=mock is not allowed when NODE_ENV=production — set it to "gmail" or disable BANK_VERIFICATION_ENABLED',
            );
          }
          return mockProvider;
        }
        return emailProvider;
      },
    },
    BankVerificationEnabledGuard,
    PaymentMatchingService,
    BankTransactionIngestionService,
    BankTransferRequestsService,
  ],
  exports: [BankTransferRequestsService],
})
export class BankTransactionsModule {}
