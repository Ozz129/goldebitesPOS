import {
  BusinessRuleException,
  CashSessionClosedException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import {
  CashMovementType,
  CashSessionRow,
  CashSessionStatus,
} from '../domain/cash-session.interface';
import { CashSessionsService } from './cash-sessions.service';

describe('CashSessionsService', () => {
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    findOpenForBranch: jest.Mock;
    findAll: jest.Mock;
    addMovement: jest.Mock;
    findMovements: jest.Mock;
    getExpectedClosingAmount: jest.Mock;
    close: jest.Mock;
  };
  let branchesService: { findOne: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: CashSessionsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';

  function makeRow(overrides: Partial<CashSessionRow> = {}): CashSessionRow {
    return {
      id: 'session-1',
      business_id: businessId,
      branch_id: branchId,
      opened_by: 'user-1',
      closed_by: null,
      opening_amount: '50000.00',
      expected_closing_amount: null,
      actual_closing_amount: null,
      difference_amount: null,
      status: CashSessionStatus.OPEN,
      opened_at: new Date(),
      closed_at: null,
      notes: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findOpenForBranch: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
      addMovement: jest.fn(),
      findMovements: jest.fn().mockResolvedValue([]),
      getExpectedClosingAmount: jest.fn().mockResolvedValue(0),
      close: jest.fn(),
    };
    branchesService = {
      findOne: jest.fn().mockResolvedValue({ id: branchId }),
    };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work({}),
      ),
    };
    auditService = { record: jest.fn() };
    service = new CashSessionsService(
      repository,
      branchesService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('open', () => {
    it('rejects opening a second session for a branch that already has one open', async () => {
      repository.findOpenForBranch.mockResolvedValue(makeRow());

      await expect(
        service.open({ businessId, branchId, openingAmount: 100 }, 'user-1'),
      ).rejects.toThrow(BusinessRuleException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('skips the OPENING movement when openingAmount is 0', async () => {
      repository.findOpenForBranch.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeRow({ opening_amount: '0.00' }));

      await service.open({ businessId, branchId, openingAmount: 0 }, 'user-1');

      expect(repository.addMovement).not.toHaveBeenCalled();
    });

    it('records an OPENING movement when openingAmount is positive', async () => {
      repository.findOpenForBranch.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeRow());

      await service.open(
        { businessId, branchId, openingAmount: 50000 },
        'user-1',
      );

      expect(repository.addMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: CashMovementType.OPENING,
          amount: 50000,
        }),
        expect.anything(),
      );
    });
  });

  describe('getOpenSessionOrFail', () => {
    it('throws CashSessionClosedException when no session is open', async () => {
      repository.findOpenForBranch.mockResolvedValue(null);

      await expect(
        service.getOpenSessionOrFail(businessId, branchId),
      ).rejects.toThrow(CashSessionClosedException);
    });
  });

  describe('recordMovement', () => {
    it('rejects recording a movement on a closed session', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: CashSessionStatus.CLOSED }),
      );

      await expect(
        service.recordMovement(
          businessId,
          'session-1',
          CashMovementType.EXPENSE,
          100,
          undefined,
        ),
      ).rejects.toThrow(CashSessionClosedException);
    });
  });

  describe('close', () => {
    it('rejects closing an already-closed session', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: CashSessionStatus.CLOSED }),
      );

      await expect(
        service.close(businessId, 'session-1', { actualClosingAmount: 50000 }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('computes the difference between actual and expected closing amounts', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.getExpectedClosingAmount.mockResolvedValue(55000);
      repository.close.mockResolvedValue(
        makeRow({
          status: CashSessionStatus.CLOSED,
          expected_closing_amount: '55000.00',
          actual_closing_amount: '54000.00',
          difference_amount: '-1000.00',
        }),
      );

      const result = await service.close(businessId, 'session-1', {
        actualClosingAmount: 54000,
      });

      expect(repository.close).toHaveBeenCalledWith(
        'session-1',
        businessId,
        undefined,
        55000,
        54000,
        -1000,
        undefined,
        expect.anything(),
      );
      expect(result.differenceAmount).toBe(-1000);
    });

    it('throws EntityNotFoundException when the session vanished mid-transaction', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.getExpectedClosingAmount.mockResolvedValue(0);
      repository.close.mockResolvedValue(null);

      await expect(
        service.close(businessId, 'session-1', { actualClosingAmount: 0 }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
