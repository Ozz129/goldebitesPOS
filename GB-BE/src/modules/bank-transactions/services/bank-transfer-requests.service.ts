import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/app.config';
import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions';
import { OrderStatus } from '../../orders/domain/order.interface';
import { OrdersService } from '../../orders/services/orders.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { BankTransferRequestRow, BankTransferStatusView } from '../domain/bank-transaction.types';
import { BankTransactionMapper, BankTransferRequestMapper } from '../mappers/bank-transaction.mapper';
import { BANK_TRANSACTIONS_REPOSITORY } from '../repositories/bank-transactions.repository.interface';
import type { IBankTransactionsRepository } from '../repositories/bank-transactions.repository.interface';
import { BANK_TRANSFER_REQUESTS_REPOSITORY } from '../repositories/bank-transfer-requests.repository.interface';
import type { IBankTransferRequestsRepository } from '../repositories/bank-transfer-requests.repository.interface';
import { BankTransactionIngestionService } from './bank-transaction-ingestion.service';
import { PaymentMatchingService } from './payment-matching.service';

@Injectable()
export class BankTransferRequestsService {
  constructor(
    @Inject(BANK_TRANSFER_REQUESTS_REPOSITORY)
    private readonly requestsRepository: IBankTransferRequestsRepository,
    @Inject(BANK_TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: IBankTransactionsRepository,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly matchingService: PaymentMatchingService,
    private readonly ingestionService: BankTransactionIngestionService,
    private readonly configService: ConfigService,
  ) {}

  private get config(): AppConfig['bankVerification'] {
    return this.configService.getOrThrow<AppConfig>('app').bankVerification;
  }

  /** Cashier clicked "Cobrar con transferencia Bancolombia" — opens a WAITING request for the balance due. */
  async start(
    businessId: string,
    orderId: string,
    actorUserId: string | undefined,
  ): Promise<BankTransferStatusView> {
    const order = await this.ordersService.getOwnedOrFail(businessId, orderId);
    if (order.status === OrderStatus.CANCELLED) {
      throw new BusinessRuleException(
        'Cannot start a bank transfer request for a cancelled order',
        'ORDER_CANCELLED',
      );
    }

    const existing = await this.requestsRepository.findActiveByOrder(orderId);
    if (existing) {
      return this.buildStatusView(existing);
    }

    const payments = await this.paymentsService.findByOrder(businessId, orderId);
    const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const balanceDue = round2(parseFloat(order.total_amount) - amountPaid);
    if (balanceDue <= 0) {
      throw new BusinessRuleException('This order has no pending balance to charge', 'ORDER_FULLY_PAID');
    }

    const created = await this.requestsRepository.create(
      { businessId, orderId, amountExpected: balanceDue },
      actorUserId,
    );
    // The email might have already arrived before the cashier clicked "start" — check right away.
    await this.matchingService.attemptMatchForRequest(created);

    const refreshed = await this.requestsRepository.findById(created.id);
    return this.buildStatusView(refreshed ?? created);
  }

  async getStatus(businessId: string, orderId: string): Promise<BankTransferStatusView> {
    await this.ordersService.getOwnedOrFail(businessId, orderId);
    const latest = await this.requestsRepository.findLatestByOrder(orderId);
    if (!latest || latest.business_id !== businessId) {
      return { state: 'NONE' };
    }
    return this.buildStatusView(latest);
  }

  /** "Verificar nuevamente" — forces a fresh check instead of waiting for the next background tick. */
  async recheck(businessId: string, orderId: string): Promise<BankTransferStatusView> {
    await this.ingestionService.runIngestionTick();
    return this.getStatus(businessId, orderId);
  }

  async cancel(businessId: string, orderId: string): Promise<BankTransferStatusView> {
    await this.ordersService.getOwnedOrFail(businessId, orderId);
    const active = await this.requestsRepository.findActiveByOrder(orderId);
    if (!active) {
      return { state: 'NONE' };
    }
    const cancelled = await this.requestsRepository.cancel(active.id);
    return this.buildStatusView(cancelled ?? active);
  }

  /** "Revisión manual" — cashier explicitly picks one of the ambiguous candidate transactions. */
  async confirmManual(
    businessId: string,
    orderId: string,
    transactionId: string,
    actorUserId: string,
  ): Promise<BankTransferStatusView> {
    await this.ordersService.getOwnedOrFail(businessId, orderId);
    const active = await this.requestsRepository.findActiveByOrder(orderId);
    if (!active) {
      throw new BusinessRuleException(
        'This order has no active bank transfer request to confirm',
        'BANK_TRANSFER_REQUEST_NOT_WAITING',
      );
    }
    const transaction = await this.transactionsRepository.findById(transactionId);
    if (!transaction || !['PENDING', 'REVIEW_REQUIRED'].includes(transaction.status)) {
      throw new EntityNotFoundException('BankTransaction', transactionId);
    }

    const confirmed = await this.matchingService.confirmManualMatch(active, transaction, actorUserId);
    if (!confirmed) {
      throw new BusinessRuleException(
        'This transaction was already used to confirm another order',
        'BANK_TRANSACTION_ALREADY_USED',
      );
    }

    const refreshed = await this.requestsRepository.findById(active.id);
    return this.buildStatusView(refreshed ?? active);
  }

  private async buildStatusView(request: BankTransferRequestRow): Promise<BankTransferStatusView> {
    if (request.status === 'WAITING') {
      const windowStart = new Date(
        request.created_at.getTime() - this.config.matchBackwardToleranceMinutes * 60_000,
      );
      const windowEnd = new Date(request.created_at.getTime() + this.config.matchWindowMinutes * 60_000);
      const candidates = await this.transactionsRepository.findCandidatesByAmountWindow(
        parseFloat(request.amount_expected),
        windowStart,
        windowEnd,
      );
      const reviewCandidates = candidates
        .filter((candidate) => candidate.status === 'REVIEW_REQUIRED')
        .map((candidate) => {
          const domain = BankTransactionMapper.toDomain(candidate);
          return {
            transactionId: domain.id,
            amount: domain.amount,
            receivedAt: domain.receivedAt,
            reference: domain.reference,
          };
        });
      return { state: 'WAITING', request: BankTransferRequestMapper.toDomain(request), reviewCandidates };
    }

    if (request.status === 'MATCHED') {
      return { state: 'MATCHED', request: BankTransferRequestMapper.toDomain(request) };
    }

    return { state: 'NONE' };
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
