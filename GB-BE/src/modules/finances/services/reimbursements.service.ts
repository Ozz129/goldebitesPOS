import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { CashMovementType } from '../../cash-sessions/domain/cash-session.interface';
import { CashSessionsService } from '../../cash-sessions/services/cash-sessions.service';
import { ReimbursementObligation, ReimbursementPayment } from '../domain/reimbursement.interface';
import {
  CreateReimbursementObligationData,
  ReimbursementObligationQuery,
  ReimbursementObligationStatus,
  ReimbursementObligationSummary,
} from '../domain/reimbursement.types';
import { ReimbursementObligationMapper, ReimbursementPaymentMapper } from '../mappers/reimbursement.mapper';
import { REIMBURSEMENT_OBLIGATIONS_REPOSITORY } from '../repositories/reimbursement-obligations.repository.interface';
import type { IReimbursementObligationsRepository } from '../repositories/reimbursement-obligations.repository.interface';
import { REIMBURSEMENT_PAYMENTS_REPOSITORY } from '../repositories/reimbursement-payments.repository.interface';
import type { IReimbursementPaymentsRepository } from '../repositories/reimbursement-payments.repository.interface';

@Injectable()
export class ReimbursementsService {
  constructor(
    @Inject(REIMBURSEMENT_OBLIGATIONS_REPOSITORY)
    private readonly obligationsRepository: IReimbursementObligationsRepository,
    @Inject(REIMBURSEMENT_PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: IReimbursementPaymentsRepository,
    private readonly cashSessionsService: CashSessionsService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  /** Called by ExpensesService inside its own create() transaction when paymentSource is PERSONAL_MONEY. */
  async createForExpense(
    data: CreateReimbursementObligationData,
    client: DbClient,
  ): Promise<ReimbursementObligation> {
    const row = await this.obligationsRepository.create(data, client);
    return ReimbursementObligationMapper.toDomain(row);
  }

  async findAll(query: ReimbursementObligationQuery): Promise<PaginatedResult<ReimbursementObligation>> {
    const { rows, total } = await this.obligationsRepository.findAll(query);
    return {
      data: rows.map((row) => ReimbursementObligationMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<{ obligation: ReimbursementObligation; payments: ReimbursementPayment[] }> {
    const obligation = await this.getOwnedOrFail(businessId, id);
    const paymentRows = await this.paymentsRepository.findByObligation(id);
    return {
      obligation: ReimbursementObligationMapper.toDomain(obligation),
      payments: paymentRows.map((row) => ReimbursementPaymentMapper.toDomain(row)),
    };
  }

  async getSummary(businessId: string): Promise<ReimbursementObligationSummary> {
    return this.obligationsRepository.getSummary(businessId);
  }

  async payObligation(
    businessId: string,
    branchId: string,
    obligationId: string,
    amount: number,
    actorUserId: string,
    notes?: string,
  ): Promise<ReimbursementObligation> {
    const row = await this.getOwnedOrFail(businessId, obligationId);
    const obligation = ReimbursementObligationMapper.toDomain(row);

    if (obligation.status === ReimbursementObligationStatus.VOIDED) {
      throw new BusinessRuleException('This obligation was voided', 'OBLIGATION_VOIDED');
    }
    if (obligation.status === ReimbursementObligationStatus.REIMBURSED) {
      throw new BusinessRuleException('This obligation is already fully reimbursed', 'OBLIGATION_ALREADY_REIMBURSED');
    }
    if (amount > obligation.pendingAmount) {
      throw new BusinessRuleException(
        `Reimbursement amount exceeds the pending balance of ${obligation.pendingAmount}`,
        'REIMBURSEMENT_EXCEEDS_PENDING_BALANCE',
      );
    }

    await this.transactionService.execute(async (client) => {
      const session = await this.cashSessionsService.getOpenSessionOrFail(businessId, branchId, client);
      const movement = await this.cashSessionsService.recordMovementInTransaction(
        {
          cashSessionId: session.id,
          movementType: CashMovementType.REIMBURSEMENT,
          amount,
          description: `Reembolso a ${obligation.payerName}`,
          createdBy: actorUserId,
        },
        client,
      );

      await this.paymentsRepository.create(
        {
          obligationId,
          branchId,
          cashMovementId: movement.id,
          amount,
          notes,
          createdBy: actorUserId,
        },
        client,
      );

      const newReimbursed = obligation.reimbursedAmount + amount;
      const newStatus =
        newReimbursed >= obligation.originalAmount
          ? ReimbursementObligationStatus.REIMBURSED
          : ReimbursementObligationStatus.PARTIALLY_REIMBURSED;
      await this.obligationsRepository.updateStatus(obligationId, newStatus, client);

      await this.auditService.record(
        {
          businessId,
          branchId,
          userId: actorUserId,
          entityType: 'reimbursement_obligation',
          entityId: obligationId,
          action: 'PAY',
          oldValues: { status: obligation.status, reimbursedAmount: obligation.reimbursedAmount },
          newValues: { status: newStatus, reimbursedAmount: newReimbursed, paymentAmount: amount },
          metadata: { cashMovementId: movement.id, sourceExpenseId: obligation.expenseId },
        },
        client,
      );
    });

    const finalRow = await this.getOwnedOrFail(businessId, obligationId);
    return ReimbursementObligationMapper.toDomain(finalRow);
  }

  async voidObligation(
    businessId: string,
    obligationId: string,
    actorUserId: string,
    reason: string,
  ): Promise<void> {
    const row = await this.getOwnedOrFail(businessId, obligationId);
    const obligation = ReimbursementObligationMapper.toDomain(row);

    if (obligation.status === ReimbursementObligationStatus.VOIDED) {
      throw new BusinessRuleException('This obligation was already voided', 'OBLIGATION_ALREADY_VOIDED');
    }
    if (obligation.status === ReimbursementObligationStatus.REIMBURSED) {
      throw new BusinessRuleException('This obligation is already fully reimbursed', 'OBLIGATION_ALREADY_REIMBURSED');
    }

    await this.obligationsRepository.void(obligationId, actorUserId, reason);

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'reimbursement_obligation',
      entityId: obligationId,
      action: 'VOID',
      oldValues: { status: obligation.status },
      newValues: { status: ReimbursementObligationStatus.VOIDED },
      metadata: { reason },
    });
  }

  private async getOwnedOrFail(businessId: string, id: string) {
    const row = await this.obligationsRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('ReimbursementObligation', id);
    }
    return row;
  }
}
