import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException, ConflictException, EntityNotFoundException } from '../../../common/exceptions';
import { DbClient } from '../../../database/types/database.types';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { CashSessionsService } from '../../cash-sessions/services/cash-sessions.service';
import { FundBalance, FundMovement, FundRow } from '../domain/fund.interface';
import { ApplyFundMovementData, FundMovementDirection, FundType, InitializeFundData } from '../domain/fund.types';
import { FundMovementMapper } from '../mappers/fund.mapper';
import { FUNDS_REPOSITORY } from '../repositories/funds.repository.interface';
import type { IFundsRepository } from '../repositories/funds.repository.interface';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class FundsService {
  constructor(
    @Inject(FUNDS_REPOSITORY)
    private readonly fundsRepository: IFundsRepository,
    private readonly branchesService: BranchesService,
    private readonly cashSessionsService: CashSessionsService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async initializeReserve(data: InitializeFundData): Promise<FundMovement> {
    const branchId = await this.resolveLocationBranchId(FundType.CASH_RESERVE, data.businessId, data.branchId);
    if (branchId) {
      // AC-01: the reserve's opening count must not double-count cash that's
      // already being tracked by an open Caja operativa at the same branch.
      const hasOpenSession = await this.cashSessionsService.hasOpenSession(data.businessId, branchId);
      if (hasOpenSession) {
        throw new BusinessRuleException(
          'Cannot initialize Reserva de efectivo while this branch has an open cash session — close it first so the count is not double-counted as operational cash',
          'OPEN_CASH_SESSION',
        );
      }
    }
    return this.initializeFund(data, FundType.CASH_RESERVE, branchId, 'RESERVE_INITIALIZATION', 'INITIALIZE_RESERVE');
  }

  async initializeBankAccount(data: Omit<InitializeFundData, 'branchId'>): Promise<FundMovement> {
    const branchId = await this.resolveLocationBranchId(FundType.BANK_ACCOUNT, data.businessId);
    return this.initializeFund(data, FundType.BANK_ACCOUNT, branchId, 'BANK_ACCOUNT_INITIALIZATION', 'INITIALIZE_BANK_ACCOUNT');
  }

  /**
   * The reusable primitive GOL-5/6/7/9 call to credit a fund. NEXT_OPENING_FUND
   * has no initialization step (per GOL-12 scope) — its fund row is created
   * lazily here on first use.
   */
  async credit(data: ApplyFundMovementData): Promise<FundMovement> {
    return this.applyMovement(data, FundMovementDirection.CREDIT);
  }

  /** Same as credit(), but rejects if the debit would take the fund negative — no partial change. */
  async debit(data: ApplyFundMovementData): Promise<FundMovement> {
    return this.applyMovement(data, FundMovementDirection.DEBIT);
  }

  async getBalance(businessId: string, fundType: FundType, branchId?: string): Promise<FundBalance> {
    const resolvedBranchId = await this.resolveLocationBranchId(fundType, businessId, branchId);
    const fund = await this.fundsRepository.findFund(businessId, resolvedBranchId, fundType);
    if (!fund) {
      return { fundType, businessId, branchId: resolvedBranchId, balance: 0, initializedAt: null };
    }
    const latest = await this.fundsRepository.findLatestMovement(fund.id);
    return {
      fundType,
      businessId,
      branchId: resolvedBranchId,
      balance: latest ? parseFloat(latest.balance_after) : 0,
      initializedAt: fund.initialized_at,
    };
  }

  private async initializeFund(
    data: Omit<InitializeFundData, 'branchId'> & { branchId?: string },
    fundType: FundType,
    branchId: string | null,
    sourceType: string,
    auditAction: string,
  ): Promise<FundMovement> {
    if (data.amount <= 0) {
      throw new BusinessRuleException('Initialization amount must be greater than zero', 'INVALID_AMOUNT');
    }

    return this.transactionService.execute(async (client) => {
      const fund = await this.fundsRepository.getOrCreateFundForUpdate(data.businessId, branchId, fundType, client);
      if (fund.initialized_at) {
        throw new BusinessRuleException(
          'This fund was already initialized — use a future adjustment instead',
          'FUND_ALREADY_INITIALIZED',
        );
      }

      const movementRow = await this.insertMovementLocked(
        fund,
        FundMovementDirection.CREDIT,
        data.amount,
        sourceType,
        undefined,
        data.notes,
        data.actorUserId,
        client,
      );

      await this.fundsRepository.markInitialized(fund.id, data.actorUserId, data.notes, client);

      await this.auditService.record(
        {
          businessId: data.businessId,
          branchId: branchId ?? undefined,
          userId: data.actorUserId,
          entityType: 'fund',
          entityId: fund.id,
          action: auditAction,
          newValues: { fundType, amount: data.amount, notes: data.notes },
        },
        client,
      );

      return FundMovementMapper.toDomain(movementRow);
    });
  }

  private async applyMovement(
    data: ApplyFundMovementData,
    direction: FundMovementDirection,
  ): Promise<FundMovement> {
    if (data.amount <= 0) {
      throw new BusinessRuleException('Movement amount must be greater than zero', 'INVALID_AMOUNT');
    }

    const branchId = await this.resolveLocationBranchId(data.fundType, data.businessId, data.branchId);

    return this.transactionService.execute(async (client) => {
      // getOrCreateFundForUpdate both locks an existing row and (harmlessly,
      // for NEXT_OPENING_FUND) creates one on first use. For CASH_RESERVE/
      // BANK_ACCOUNT, a freshly-created row (initialized_at still null) means
      // this fund was never initialized — reject and roll back before
      // that row is ever committed.
      const fund = await this.fundsRepository.getOrCreateFundForUpdate(data.businessId, branchId, data.fundType, client);
      if (data.fundType !== FundType.NEXT_OPENING_FUND && !fund.initialized_at) {
        throw new EntityNotFoundException('Fund', data.fundType);
      }

      // BR-06/AC-09: sourceType+sourceId is mandatory (see ApplyFundMovementData),
      // so this lookup always runs — the same source can never double-apply.
      const existingMovement = await this.fundsRepository.findMovementBySource(
        fund.id,
        data.sourceType,
        data.sourceId,
        client,
      );
      if (existingMovement) {
        const isSameOperation =
          existingMovement.direction === direction && parseFloat(existingMovement.amount) === data.amount;
        if (!isSameOperation) {
          throw new ConflictException(
            `Source ${data.sourceType}:${data.sourceId} was already applied to this fund with a different amount or direction`,
            'FUND_MOVEMENT_SOURCE_CONFLICT',
          );
        }
        // Idempotent retry: the exact same operation already applied — return it instead of double-applying.
        return FundMovementMapper.toDomain(existingMovement);
      }

      const movementRow = await this.insertMovementLocked(
        fund,
        direction,
        data.amount,
        data.sourceType,
        data.sourceId,
        data.notes,
        data.actorUserId,
        client,
      );

      return FundMovementMapper.toDomain(movementRow);
    });
  }

  /** Assumes `fund`'s row is already locked (FOR UPDATE) in the caller's transaction. */
  private async insertMovementLocked(
    fund: FundRow,
    direction: FundMovementDirection,
    amount: number,
    sourceType: string,
    sourceId: string | undefined,
    notes: string | undefined,
    actorUserId: string | undefined,
    client: DbClient,
  ) {
    const latest = await this.fundsRepository.findLatestMovement(fund.id, client);
    const balanceBefore = latest ? parseFloat(latest.balance_after) : 0;
    const balanceAfter = round2(
      direction === FundMovementDirection.CREDIT ? balanceBefore + amount : balanceBefore - amount,
    );

    if (balanceAfter < 0) {
      throw new BusinessRuleException(
        `This movement would leave the fund with a negative balance (available: ${balanceBefore})`,
        'INSUFFICIENT_FUND_BALANCE',
      );
    }

    return this.fundsRepository.insertMovement(
      {
        fundId: fund.id,
        direction,
        amount,
        balanceBefore,
        balanceAfter,
        sourceType,
        sourceId,
        notes,
        createdBy: actorUserId,
      },
      client,
    );
  }

  /**
   * BANK_ACCOUNT is always business-level (BR-02) — short-circuits here so no
   * call site can accidentally demand a branch for it (this used to be a
   * separate hardcoded `null` in initializeBankAccount only, which meant
   * getBalance() didn't get the same treatment — fixed by centralizing it).
   * CASH_RESERVE/NEXT_OPENING_FUND: if the business has no active branches
   * the fund is business-level too (branchId null, none requested);
   * otherwise branchId is required and validated.
   */
  private async resolveLocationBranchId(
    fundType: FundType,
    businessId: string,
    branchId?: string,
  ): Promise<string | null> {
    if (fundType === FundType.BANK_ACCOUNT) {
      return null;
    }
    const activeBranches = await this.branchesService.findAll({ businessId, isActive: true, page: 1, limit: 1 });
    if (activeBranches.meta.total === 0) {
      return null;
    }
    if (!branchId) {
      throw new BusinessRuleException(
        'branchId is required for this fund — the business has active branches',
        'BRANCH_REQUIRED',
      );
    }
    await this.branchesService.findOne(businessId, branchId);
    return branchId;
  }
}
