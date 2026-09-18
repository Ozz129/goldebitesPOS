import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions';
import { CashMovementType } from '../../cash-sessions/domain/cash-session.interface';
import { ReimbursementObligationRow } from '../domain/reimbursement.interface';
import { ReimbursementObligationStatus } from '../domain/reimbursement.types';
import { ReimbursementsService } from './reimbursements.service';

describe('ReimbursementsService', () => {
  let obligationsRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    updateStatus: jest.Mock;
    void: jest.Mock;
    getSummary: jest.Mock;
  };
  let paymentsRepository: { create: jest.Mock; findByObligation: jest.Mock };
  let cashSessionsService: { getOpenSessionOrFail: jest.Mock; recordMovementInTransaction: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: ReimbursementsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const obligationId = 'obligation-1';
  const actorUserId = 'user-1';

  function makeObligationRow(overrides: Partial<ReimbursementObligationRow> = {}): ReimbursementObligationRow {
    return {
      id: obligationId,
      business_id: businessId,
      expense_id: 'expense-1',
      payer_employee_id: null,
      payer_name: 'Carlos',
      original_amount: '100000.00',
      reimbursed_amount: '0',
      status: ReimbursementObligationStatus.PENDING,
      voided_at: null,
      voided_by: null,
      void_reason: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    obligationsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
      void: jest.fn(),
      getSummary: jest.fn(),
    };
    paymentsRepository = { create: jest.fn(), findByObligation: jest.fn().mockResolvedValue([]) };
    cashSessionsService = {
      getOpenSessionOrFail: jest.fn().mockResolvedValue({ id: 'session-1' }),
      recordMovementInTransaction: jest.fn().mockResolvedValue({ id: 'movement-1' }),
    };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) => work({})),
    };
    auditService = { record: jest.fn() };
    service = new ReimbursementsService(
      obligationsRepository as never,
      paymentsRepository as never,
      cashSessionsService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('payObligation', () => {
    it('a partial payment moves status to PARTIALLY_REIMBURSED and records a REIMBURSEMENT cash movement', async () => {
      obligationsRepository.findById.mockResolvedValue(makeObligationRow());

      await service.payObligation(businessId, branchId, obligationId, 40000, actorUserId, 'abono');

      expect(cashSessionsService.getOpenSessionOrFail).toHaveBeenCalledWith(businessId, branchId, expect.anything());
      expect(cashSessionsService.recordMovementInTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ movementType: CashMovementType.REIMBURSEMENT, amount: 40000 }),
        expect.anything(),
      );
      expect(paymentsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ obligationId, branchId, amount: 40000, cashMovementId: 'movement-1' }),
        expect.anything(),
      );
      expect(obligationsRepository.updateStatus).toHaveBeenCalledWith(
        obligationId,
        ReimbursementObligationStatus.PARTIALLY_REIMBURSED,
        expect.anything(),
      );
    });

    it('a payment that completes the balance moves status to REIMBURSED', async () => {
      obligationsRepository.findById.mockResolvedValue(
        makeObligationRow({ reimbursed_amount: '60000' }),
      );

      await service.payObligation(businessId, branchId, obligationId, 40000, actorUserId);

      expect(obligationsRepository.updateStatus).toHaveBeenCalledWith(
        obligationId,
        ReimbursementObligationStatus.REIMBURSED,
        expect.anything(),
      );
    });

    it('rejects a payment exceeding the pending balance, touching nothing', async () => {
      obligationsRepository.findById.mockResolvedValue(makeObligationRow({ reimbursed_amount: '90000' }));

      await expect(
        service.payObligation(businessId, branchId, obligationId, 20000, actorUserId),
      ).rejects.toThrow(BusinessRuleException);
      expect(transactionService.execute).not.toHaveBeenCalled();
      expect(obligationsRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('rejects paying a VOIDED obligation', async () => {
      obligationsRepository.findById.mockResolvedValue(
        makeObligationRow({ status: ReimbursementObligationStatus.VOIDED }),
      );

      await expect(
        service.payObligation(businessId, branchId, obligationId, 10000, actorUserId),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects paying an already-REIMBURSED obligation', async () => {
      obligationsRepository.findById.mockResolvedValue(
        makeObligationRow({ status: ReimbursementObligationStatus.REIMBURSED, reimbursed_amount: '100000' }),
      );

      await expect(
        service.payObligation(businessId, branchId, obligationId, 10000, actorUserId),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('throws EntityNotFoundException for an unknown obligation', async () => {
      obligationsRepository.findById.mockResolvedValue(null);

      await expect(
        service.payObligation(businessId, branchId, 'missing-id', 10000, actorUserId),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('voidObligation', () => {
    it('voids a PENDING obligation', async () => {
      obligationsRepository.findById.mockResolvedValue(makeObligationRow());

      await service.voidObligation(businessId, obligationId, actorUserId, 'no se va a cobrar');

      expect(obligationsRepository.void).toHaveBeenCalledWith(obligationId, actorUserId, 'no se va a cobrar');
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'VOID', newValues: { status: ReimbursementObligationStatus.VOIDED } }),
      );
    });

    it('voids a PARTIALLY_REIMBURSED obligation without reversing prior payments', async () => {
      obligationsRepository.findById.mockResolvedValue(
        makeObligationRow({ status: ReimbursementObligationStatus.PARTIALLY_REIMBURSED, reimbursed_amount: '30000' }),
      );

      await service.voidObligation(businessId, obligationId, actorUserId, 'no se va a cobrar el resto');

      expect(obligationsRepository.void).toHaveBeenCalledWith(obligationId, actorUserId, 'no se va a cobrar el resto');
      expect(paymentsRepository.create).not.toHaveBeenCalled();
    });

    it('rejects voiding an already-REIMBURSED obligation', async () => {
      obligationsRepository.findById.mockResolvedValue(
        makeObligationRow({ status: ReimbursementObligationStatus.REIMBURSED, reimbursed_amount: '100000' }),
      );

      await expect(service.voidObligation(businessId, obligationId, actorUserId, 'x')).rejects.toThrow(
        BusinessRuleException,
      );
      expect(obligationsRepository.void).not.toHaveBeenCalled();
    });

    it('rejects voiding an already-VOIDED obligation', async () => {
      obligationsRepository.findById.mockResolvedValue(
        makeObligationRow({ status: ReimbursementObligationStatus.VOIDED }),
      );

      await expect(service.voidObligation(businessId, obligationId, actorUserId, 'x')).rejects.toThrow(
        BusinessRuleException,
      );
    });
  });
});
