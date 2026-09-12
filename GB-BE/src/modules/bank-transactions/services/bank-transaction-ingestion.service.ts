import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/app.config';
import { BANK_TRANSACTION_PROVIDER } from '../providers/bank-transaction-provider.interface';
import type { BankTransactionProvider } from '../providers/bank-transaction-provider.interface';
import { BANK_TRANSACTIONS_REPOSITORY } from '../repositories/bank-transactions.repository.interface';
import type { IBankTransactionsRepository } from '../repositories/bank-transactions.repository.interface';
import { BANK_TRANSFER_REQUESTS_REPOSITORY } from '../repositories/bank-transfer-requests.repository.interface';
import type { IBankTransferRequestsRepository } from '../repositories/bank-transfer-requests.repository.interface';
import { PaymentMatchingService } from './payment-matching.service';

/**
 * Ticks the configured BankTransactionProvider on an interval (no @nestjs/schedule needed for
 * a single setInterval), ingests new transactions idempotently, and runs matching against every
 * WAITING request for the configured business. Also exposes runIngestionTick() directly for
 * "Verificar nuevamente" (on-demand, doesn't wait for the next tick).
 */
@Injectable()
export class BankTransactionIngestionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BankTransactionIngestionService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastCheckedAt = new Date();
  private ingesting = false;

  constructor(
    @Inject(BANK_TRANSACTION_PROVIDER) private readonly provider: BankTransactionProvider,
    @Inject(BANK_TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: IBankTransactionsRepository,
    @Inject(BANK_TRANSFER_REQUESTS_REPOSITORY)
    private readonly requestsRepository: IBankTransferRequestsRepository,
    private readonly matchingService: PaymentMatchingService,
    private readonly configService: ConfigService,
  ) {}

  private get config(): AppConfig['bankVerification'] {
    return this.configService.getOrThrow<AppConfig>('app').bankVerification;
  }

  onModuleInit(): void {
    if (!this.config.enabled) return;
    this.timer = setInterval(() => {
      this.runIngestionTick().catch((error) => {
        this.logger.error('Bank transaction ingestion tick failed', error instanceof Error ? error.stack : undefined);
      });
    }, this.config.pollIntervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** Fetches new transactions since the last successful check, ingests them, and runs matching. */
  async runIngestionTick(): Promise<void> {
    if (this.ingesting) return;
    this.ingesting = true;
    try {
      const since = this.lastCheckedAt;
      const now = new Date();
      const incoming = await this.provider.fetchNewTransactions(since);

      for (const transaction of incoming) {
        await this.transactionsRepository.insertIfNew(transaction);
      }
      this.lastCheckedAt = now;

      await this.matchWaitingRequests();
    } finally {
      this.ingesting = false;
    }
  }

  private async matchWaitingRequests(): Promise<void> {
    const businessId = this.config.businessId;
    if (!businessId) return;

    const waiting = await this.requestsRepository.findWaitingForBusiness(businessId);
    for (const request of waiting) {
      await this.matchingService.attemptMatchForRequest(request);
    }
  }
}
