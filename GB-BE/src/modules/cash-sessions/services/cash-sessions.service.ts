import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  CashSessionClosedException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import {
  CashMovement,
  CashMovementType,
  CashSession,
  CashSessionRow,
  CashSessionStatus,
  CashSessionWithMovements,
} from '../domain/cash-session.interface';
import {
  CashSessionQuery,
  CloseCashSessionData,
  OpenCashSessionData,
  RecordCashMovementData,
} from '../domain/cash-session.types';
import { CashSessionMapper } from '../mappers/cash-session.mapper';
import { CASH_SESSIONS_REPOSITORY } from '../repositories/cash-sessions.repository.interface';
import type { ICashSessionsRepository } from '../repositories/cash-sessions.repository.interface';

@Injectable()
export class CashSessionsService {
  constructor(
    @Inject(CASH_SESSIONS_REPOSITORY)
    private readonly sessionsRepository: ICashSessionsRepository,
    private readonly branchesService: BranchesService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async open(
    data: OpenCashSessionData,
    actorUserId: string,
  ): Promise<CashSession> {
    await this.branchesService.findOne(data.businessId, data.branchId);

    const existing = await this.sessionsRepository.findOpenForBranch(
      data.businessId,
      data.branchId,
    );
    if (existing) {
      throw new BusinessRuleException(
        'This branch already has an open cash session',
        'CASH_SESSION_ALREADY_OPEN',
      );
    }

    const row = await this.transactionService.execute(async (client) => {
      const created = await this.sessionsRepository.create(
        data,
        actorUserId,
        client,
      );
      if (data.openingAmount > 0) {
        await this.sessionsRepository.addMovement(
          {
            cashSessionId: created.id,
            movementType: CashMovementType.OPENING,
            amount: data.openingAmount,
            createdBy: actorUserId,
          },
          client,
        );
      }
      return created;
    });

    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'cash_session',
      entityId: row.id,
      action: 'OPEN',
      newValues: { openingAmount: data.openingAmount },
    });

    return CashSessionMapper.toDomain(row);
  }

  async findAll(
    query: CashSessionQuery,
  ): Promise<PaginatedResult<CashSession>> {
    const { rows, total } = await this.sessionsRepository.findAll(query);
    return {
      data: rows.map((row) => CashSessionMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<CashSessionWithMovements> {
    const row = await this.getOwnedOrFail(businessId, id);
    return this.buildWithMovements(row);
  }

  async findCurrent(
    businessId: string,
    branchId: string,
  ): Promise<CashSessionWithMovements> {
    await this.branchesService.findOne(businessId, branchId);
    const row = await this.sessionsRepository.findOpenForBranch(
      businessId,
      branchId,
    );
    if (!row) {
      throw new EntityNotFoundException(
        'Open cash session for branch',
        branchId,
      );
    }
    return this.buildWithMovements(row);
  }

  /** Used by DashboardService: whether the branch currently has an open register. */
  async hasOpenSession(businessId: string, branchId: string): Promise<boolean> {
    const row = await this.sessionsRepository.findOpenForBranch(
      businessId,
      branchId,
    );
    return row !== null;
  }

  /** Used by PaymentsService: the open session a CASH payment must be logged against. */
  async getOpenSessionOrFail(
    businessId: string,
    branchId: string,
  ): Promise<CashSession> {
    const row = await this.sessionsRepository.findOpenForBranch(
      businessId,
      branchId,
    );
    if (!row) {
      throw new CashSessionClosedException();
    }
    return CashSessionMapper.toDomain(row);
  }

  async recordMovement(
    businessId: string,
    cashSessionId: string,
    movementType: CashMovementType,
    amount: number,
    description: string | undefined,
    actorUserId?: string,
  ): Promise<CashMovement> {
    const session = await this.getOwnedOrFail(businessId, cashSessionId);
    if (session.status !== CashSessionStatus.OPEN) {
      throw new CashSessionClosedException(cashSessionId);
    }

    const row = await this.sessionsRepository.addMovement({
      cashSessionId,
      movementType,
      amount,
      description,
      createdBy: actorUserId,
    });

    await this.auditService.record({
      businessId,
      branchId: session.branch_id,
      userId: actorUserId,
      entityType: 'cash_movement',
      entityId: row.id,
      action: movementType,
      newValues: { amount },
    });

    return CashSessionMapper.movementToDomain(row);
  }

  /** Used by PaymentsService, inside the same transaction as recording the payment. */
  async recordSaleMovement(
    data: RecordCashMovementData,
    client?: DbClient,
  ): Promise<void> {
    await this.sessionsRepository.addMovement(data, client);
  }

  async close(
    businessId: string,
    id: string,
    data: CloseCashSessionData,
    actorUserId?: string,
  ): Promise<CashSession> {
    const session = await this.getOwnedOrFail(businessId, id);
    if (session.status !== CashSessionStatus.OPEN) {
      throw new BusinessRuleException(
        'This cash session is already closed',
        'CASH_SESSION_ALREADY_CLOSED',
      );
    }

    const row = await this.transactionService.execute(async (client) => {
      const expected = await this.sessionsRepository.getExpectedClosingAmount(
        id,
        client,
      );
      const difference = round2(data.actualClosingAmount - expected);

      const closed = await this.sessionsRepository.close(
        id,
        businessId,
        actorUserId,
        expected,
        data.actualClosingAmount,
        difference,
        data.notes,
        client,
      );
      if (!closed) {
        throw new EntityNotFoundException('CashSession', id);
      }

      if (data.actualClosingAmount > 0) {
        await this.sessionsRepository.addMovement(
          {
            cashSessionId: id,
            movementType: CashMovementType.CLOSING,
            amount: data.actualClosingAmount,
            createdBy: actorUserId,
          },
          client,
        );
      }

      return closed;
    });

    await this.auditService.record({
      businessId,
      branchId: session.branch_id,
      userId: actorUserId,
      entityType: 'cash_session',
      entityId: id,
      action: 'CLOSE',
      newValues: {
        expectedClosingAmount: row.expected_closing_amount,
        actualClosingAmount: row.actual_closing_amount,
        differenceAmount: row.difference_amount,
      },
    });

    return CashSessionMapper.toDomain(row);
  }

  private async buildWithMovements(
    row: CashSessionRow,
  ): Promise<CashSessionWithMovements> {
    const movementRows = await this.sessionsRepository.findMovements(row.id);
    return {
      ...CashSessionMapper.toDomain(row),
      movements: movementRows.map((movementRow) =>
        CashSessionMapper.movementToDomain(movementRow),
      ),
    };
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<CashSessionRow> {
    const row = await this.sessionsRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('CashSession', id);
    }
    return row;
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
