import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions';
import { FundMovementRow, FundRow } from '../domain/fund.interface';
import { FundMovementDirection, FundType } from '../domain/fund.types';
import { FundsService } from './funds.service';

describe('FundsService', () => {
  let fundsRepository: {
    getOrCreateFundForUpdate: jest.Mock;
    findFund: jest.Mock;
    markInitialized: jest.Mock;
    findLatestMovement: jest.Mock;
    findMovementBySource: jest.Mock;
    insertMovement: jest.Mock;
  };
  let branchesService: { findAll: jest.Mock; findOne: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: FundsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const actorUserId = 'user-1';

  function makeFundRow(overrides: Partial<FundRow> = {}): FundRow {
    return {
      id: 'fund-1',
      business_id: businessId,
      branch_id: branchId,
      fund_type: FundType.CASH_RESERVE,
      initialized_at: null,
      initialized_by: null,
      initialization_notes: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  function makeMovementRow(overrides: Partial<FundMovementRow> = {}): FundMovementRow {
    return {
      id: 'movement-1',
      fund_id: 'fund-1',
      direction: FundMovementDirection.CREDIT,
      amount: '100000.00',
      balance_before: '0.00',
      balance_after: '100000.00',
      source_type: 'RESERVE_INITIALIZATION',
      source_id: null,
      notes: 'conteo inicial',
      created_by: actorUserId,
      created_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    fundsRepository = {
      getOrCreateFundForUpdate: jest.fn(),
      findFund: jest.fn(),
      markInitialized: jest.fn(),
      findLatestMovement: jest.fn().mockResolvedValue(null),
      findMovementBySource: jest.fn().mockResolvedValue(null),
      insertMovement: jest.fn(),
    };
    branchesService = {
      findAll: jest.fn().mockResolvedValue({ data: [{ id: branchId }], meta: { total: 1 } }),
      findOne: jest.fn().mockResolvedValue({ id: branchId }),
    };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) => work({})),
    };
    auditService = { record: jest.fn() };
    service = new FundsService(
      fundsRepository as never,
      branchesService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('initializeReserve', () => {
    it('creates the fund, credits the initial amount, and marks it initialized', async () => {
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(makeFundRow());
      fundsRepository.insertMovement.mockResolvedValue(makeMovementRow());

      const movement = await service.initializeReserve({
        businessId,
        branchId,
        amount: 100000,
        notes: 'conteo inicial',
        actorUserId,
      });

      expect(fundsRepository.getOrCreateFundForUpdate).toHaveBeenCalledWith(
        businessId,
        branchId,
        FundType.CASH_RESERVE,
        expect.anything(),
      );
      expect(fundsRepository.insertMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: FundMovementDirection.CREDIT,
          amount: 100000,
          balanceBefore: 0,
          balanceAfter: 100000,
          sourceType: 'RESERVE_INITIALIZATION',
        }),
        expect.anything(),
      );
      expect(fundsRepository.markInitialized).toHaveBeenCalledWith('fund-1', actorUserId, 'conteo inicial', expect.anything());
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'fund', action: 'INITIALIZE_RESERVE' }),
        expect.anything(),
      );
      expect(movement.balanceAfter).toBe(100000);
    });

    it('rejects a second initialization, leaving markInitialized/insertMovement untouched afterward', async () => {
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(
        makeFundRow({ initialized_at: new Date() }),
      );

      await expect(
        service.initializeReserve({ businessId, branchId, amount: 50000, notes: 'x', actorUserId }),
      ).rejects.toThrow(BusinessRuleException);
      expect(fundsRepository.insertMovement).not.toHaveBeenCalled();
      expect(fundsRepository.markInitialized).not.toHaveBeenCalled();
    });

    it('requires branchId when the business has active branches', async () => {
      await expect(
        service.initializeReserve({ businessId, amount: 50000, notes: 'x', actorUserId }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('does not require branchId when the business has no active branches', async () => {
      branchesService.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(makeFundRow({ branch_id: null }));
      fundsRepository.insertMovement.mockResolvedValue(makeMovementRow());

      await service.initializeReserve({ businessId, amount: 50000, notes: 'x', actorUserId });

      expect(fundsRepository.getOrCreateFundForUpdate).toHaveBeenCalledWith(
        businessId,
        null,
        FundType.CASH_RESERVE,
        expect.anything(),
      );
    });

    it('rejects a zero or negative amount', async () => {
      await expect(
        service.initializeReserve({ businessId, branchId, amount: 0, notes: 'x', actorUserId }),
      ).rejects.toThrow(BusinessRuleException);
    });
  });

  describe('initializeBankAccount', () => {
    it('initializes with branchId always null, never asking for one', async () => {
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(
        makeFundRow({ branch_id: null, fund_type: FundType.BANK_ACCOUNT }),
      );
      fundsRepository.insertMovement.mockResolvedValue(
        makeMovementRow({ source_type: 'BANK_ACCOUNT_INITIALIZATION' }),
      );

      await service.initializeBankAccount({ businessId, amount: 2000000, notes: 'saldo inicial', actorUserId });

      expect(fundsRepository.getOrCreateFundForUpdate).toHaveBeenCalledWith(
        businessId,
        null,
        FundType.BANK_ACCOUNT,
        expect.anything(),
      );
      // branchesService.findAll/findOne are never consulted for the bank account.
      expect(branchesService.findAll).not.toHaveBeenCalled();
      expect(branchesService.findOne).not.toHaveBeenCalled();
    });

    it('rejects a second initialization', async () => {
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(
        makeFundRow({ branch_id: null, fund_type: FundType.BANK_ACCOUNT, initialized_at: new Date() }),
      );

      await expect(
        service.initializeBankAccount({ businessId, amount: 100, notes: 'x', actorUserId }),
      ).rejects.toThrow(BusinessRuleException);
      expect(fundsRepository.insertMovement).not.toHaveBeenCalled();
    });
  });

  describe('debit / credit', () => {
    it('debits an initialized fund, computing balance_before/after from the latest movement', async () => {
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(
        makeFundRow({ initialized_at: new Date() }),
      );
      fundsRepository.findLatestMovement.mockResolvedValue(makeMovementRow({ balance_after: '100000.00' }));
      fundsRepository.insertMovement.mockResolvedValue(
        makeMovementRow({ direction: FundMovementDirection.DEBIT, amount: '30000.00', balance_before: '100000.00', balance_after: '70000.00' }),
      );

      const movement = await service.debit({
        businessId,
        branchId,
        fundType: FundType.CASH_RESERVE,
        amount: 30000,
        sourceType: 'EXPENSE',
        sourceId: 'expense-1',
        actorUserId,
      });

      expect(fundsRepository.insertMovement).toHaveBeenCalledWith(
        expect.objectContaining({ direction: FundMovementDirection.DEBIT, balanceBefore: 100000, balanceAfter: 70000 }),
        expect.anything(),
      );
      expect(movement.balanceAfter).toBe(70000);
    });

    it('rejects a debit that would leave the fund negative, without inserting anything', async () => {
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(
        makeFundRow({ initialized_at: new Date() }),
      );
      fundsRepository.findLatestMovement.mockResolvedValue(makeMovementRow({ balance_after: '10000.00' }));

      await expect(
        service.debit({
          businessId,
          branchId,
          fundType: FundType.CASH_RESERVE,
          amount: 50000,
          sourceType: 'EXPENSE',
          sourceId: 'expense-2',
          actorUserId,
        }),
      ).rejects.toThrow(BusinessRuleException);
      expect(fundsRepository.insertMovement).not.toHaveBeenCalled();
    });

    it('rejects crediting/debiting a CASH_RESERVE or BANK_ACCOUNT that was never initialized', async () => {
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(makeFundRow({ initialized_at: null }));

      await expect(
        service.credit({
          businessId,
          branchId,
          fundType: FundType.CASH_RESERVE,
          amount: 1000,
          sourceType: 'EXPENSE',
          sourceId: 'expense-3',
          actorUserId,
        }),
      ).rejects.toThrow(EntityNotFoundException);
      expect(fundsRepository.insertMovement).not.toHaveBeenCalled();
    });

    it('is idempotent: the same sourceType+sourceId never applies twice, returns the existing movement', async () => {
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(
        makeFundRow({ initialized_at: new Date() }),
      );
      const existing = makeMovementRow({ id: 'already-applied' });
      fundsRepository.findMovementBySource.mockResolvedValue(existing);

      const movement = await service.credit({
        businessId,
        branchId,
        fundType: FundType.CASH_RESERVE,
        amount: 1000,
        sourceType: 'EXPENSE',
        sourceId: 'expense-4',
        actorUserId,
      });

      expect(movement.id).toBe('already-applied');
      expect(fundsRepository.insertMovement).not.toHaveBeenCalled();
    });

    it('NEXT_OPENING_FUND is created lazily on first use, with no prior initialization required', async () => {
      fundsRepository.getOrCreateFundForUpdate.mockResolvedValue(
        makeFundRow({ fund_type: FundType.NEXT_OPENING_FUND, initialized_at: null }),
      );
      fundsRepository.insertMovement.mockResolvedValue(
        makeMovementRow({ source_type: 'CASH_SESSION_CLOSE' }),
      );

      await expect(
        service.credit({
          businessId,
          branchId,
          fundType: FundType.NEXT_OPENING_FUND,
          amount: 30000,
          sourceType: 'CASH_SESSION_CLOSE',
          sourceId: 'session-1',
          actorUserId,
        }),
      ).resolves.toBeDefined();
      expect(fundsRepository.insertMovement).toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('returns balance 0 and initializedAt null for a fund that was never created', async () => {
      fundsRepository.findFund.mockResolvedValue(null);

      const balance = await service.getBalance(businessId, FundType.CASH_RESERVE, branchId);

      expect(balance).toEqual({ fundType: FundType.CASH_RESERVE, businessId, branchId, balance: 0, initializedAt: null });
      expect(fundsRepository.findLatestMovement).not.toHaveBeenCalled();
    });

    it('returns the latest movement balance_after for an existing fund', async () => {
      const initDate = new Date();
      fundsRepository.findFund.mockResolvedValue(makeFundRow({ initialized_at: initDate }));
      fundsRepository.findLatestMovement.mockResolvedValue(makeMovementRow({ balance_after: '42000.00' }));

      const balance = await service.getBalance(businessId, FundType.CASH_RESERVE, branchId);

      expect(balance.balance).toBe(42000);
      expect(balance.initializedAt).toBe(initDate);
    });

    it('resolves BANK_ACCOUNT with no branchId and never consults BranchesService', async () => {
      fundsRepository.findFund.mockResolvedValue(makeFundRow({ fund_type: FundType.BANK_ACCOUNT, branch_id: null }));
      fundsRepository.findLatestMovement.mockResolvedValue(makeMovementRow({ balance_after: '3200000.00' }));

      const balance = await service.getBalance(businessId, FundType.BANK_ACCOUNT);

      expect(balance.balance).toBe(3200000);
      expect(balance.branchId).toBeNull();
      expect(branchesService.findAll).not.toHaveBeenCalled();
      expect(branchesService.findOne).not.toHaveBeenCalled();
    });
  });
});
