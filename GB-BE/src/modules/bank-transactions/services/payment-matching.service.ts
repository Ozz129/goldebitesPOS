import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/app.config';
import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';
import { OrdersService } from '../../orders/services/orders.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { AuditService } from '../../audit/services/audit.service';
import { BankTransactionRow, BankTransferRequestRow } from '../domain/bank-transaction.types';
import { BANK_TRANSACTIONS_REPOSITORY } from '../repositories/bank-transactions.repository.interface';
import type { IBankTransactionsRepository } from '../repositories/bank-transactions.repository.interface';
import { BANK_TRANSFER_REQUESTS_REPOSITORY } from '../repositories/bank-transfer-requests.repository.interface';
import type { IBankTransferRequestsRepository } from '../repositories/bank-transfer-requests.repository.interface';

export type MatchOutcome = 'MATCHED' | 'REVIEW_REQUIRED' | 'NO_MATCH';

/**
 * Confirms a WAITING bank_transfer_request only when the evidence is unambiguous. Prioritizes
 * false negatives over false positives: an ambiguous case is left for manual review rather than
 * auto-confirmed, per explicit product requirement — a wrong automatic match is worse than an
 * extra manual click.
 */
@Injectable()
export class PaymentMatchingService {
  private readonly logger = new Logger(PaymentMatchingService.name);

  constructor(
    @Inject(BANK_TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: IBankTransactionsRepository,
    @Inject(BANK_TRANSFER_REQUESTS_REPOSITORY)
    private readonly requestsRepository: IBankTransferRequestsRepository,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  private get config(): AppConfig['bankVerification'] {
    return this.configService.getOrThrow<AppConfig>('app').bankVerification;
  }

  /** Attempts to resolve one WAITING request against currently PENDING/REVIEW_REQUIRED transactions. */
  async attemptMatchForRequest(requestRow: BankTransferRequestRow): Promise<MatchOutcome> {
    const amount = parseFloat(requestRow.amount_expected);
    const windowStart = new Date(
      requestRow.created_at.getTime() - this.config.matchBackwardToleranceMinutes * 60_000,
    );
    const windowEnd = new Date(requestRow.created_at.getTime() + this.config.matchWindowMinutes * 60_000);

    const candidates = await this.transactionsRepository.findCandidatesByAmountWindow(
      amount,
      windowStart,
      windowEnd,
    );
    if (candidates.length === 0) {
      return 'NO_MATCH';
    }

    const order = await this.ordersService.getOwnedOrFail(requestRow.business_id, requestRow.order_id);
    const referenceMatch = candidates.find(
      (candidate) => candidate.reference && candidate.reference.includes(order.order_number),
    );
    const chosen = referenceMatch ?? (candidates.length === 1 ? candidates[0] : undefined);

    if (!chosen) {
      for (const candidate of candidates) {
        if (candidate.status === 'PENDING') {
          await this.transactionsRepository.markReviewRequired(candidate.id);
        }
      }
      this.logger.warn(
        `Ambiguous match for order ${order.order_number}: ${candidates.length} candidate transactions for $${amount}`,
      );
      return 'REVIEW_REQUIRED';
    }

    const confirmed = await this.confirmMatch(requestRow, chosen, undefined);
    return confirmed ? 'MATCHED' : 'NO_MATCH';
  }

  /** Cashier explicitly picked one of the REVIEW_REQUIRED candidates shown for this order. */
  async confirmManualMatch(
    requestRow: BankTransferRequestRow,
    transactionRow: BankTransactionRow,
    confirmedByUserId: string,
  ): Promise<boolean> {
    return this.confirmMatch(requestRow, transactionRow, confirmedByUserId);
  }

  private async confirmMatch(
    requestRow: BankTransferRequestRow,
    transactionRow: BankTransactionRow,
    confirmedByUserId: string | undefined,
  ): Promise<boolean> {
    const claimedTransaction = await this.transactionsRepository.claimForOrder(
      transactionRow.id,
      requestRow.order_id,
    );
    if (!claimedTransaction) {
      // Someone else (another ingestion tick, "verificar nuevamente", or a manual confirm) already used it.
      return false;
    }

    const claimedRequest = await this.requestsRepository.claim(
      requestRow.id,
      transactionRow.id,
      confirmedByUserId,
    );
    if (!claimedRequest) {
      await this.transactionsRepository.release(claimedTransaction.id, transactionRow.status as 'PENDING' | 'REVIEW_REQUIRED');
      return false;
    }

    try {
      const payment = await this.paymentsService.create(
        requestRow.business_id,
        {
          orderId: requestRow.order_id,
          paymentMethod: PaymentMethod.TRANSFER,
          amount: parseFloat(claimedTransaction.amount),
          reference: claimedTransaction.reference ?? claimedTransaction.external_id,
        },
        confirmedByUserId,
      );

      await this.auditService.record({
        businessId: requestRow.business_id,
        userId: confirmedByUserId,
        entityType: 'bank_transfer_request',
        entityId: requestRow.id,
        action: confirmedByUserId ? 'MANUAL_MATCH' : 'AUTO_MATCH',
        newValues: { transactionId: claimedTransaction.id, paymentId: payment.id },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Payment creation failed after claiming transaction ${claimedTransaction.id} for order ${requestRow.order_id} — releasing the claim`,
        error instanceof Error ? error.stack : undefined,
      );
      await this.transactionsRepository.release(claimedTransaction.id, transactionRow.status as 'PENDING' | 'REVIEW_REQUIRED');
      await this.requestsRepository.release(requestRow.id);
      throw error;
    }
  }
}
