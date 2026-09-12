import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';
import {
  BankTransactionRow,
  BankTransactionSource,
  BankTransactionStatus,
  BankTransferRequestRow,
  BankTransferRequestStatus,
} from '../domain/bank-transaction.types';
import { PaymentMatchingService } from './payment-matching.service';

describe('PaymentMatchingService', () => {
  let transactionsRepository: {
    findCandidatesByAmountWindow: jest.Mock;
    claimForOrder: jest.Mock;
    markReviewRequired: jest.Mock;
    release: jest.Mock;
  };
  let requestsRepository: { claim: jest.Mock; release: jest.Mock };
  let ordersService: { getOwnedOrFail: jest.Mock };
  let paymentsService: { create: jest.Mock };
  let auditService: { record: jest.Mock };
  let configService: { getOrThrow: jest.Mock };
  let service: PaymentMatchingService;

  const businessId = 'business-1';
  const orderId = 'order-1';

  function makeRequest(overrides: Partial<BankTransferRequestRow> = {}): BankTransferRequestRow {
    return {
      id: 'request-1',
      business_id: businessId,
      order_id: orderId,
      amount_expected: '38500.00',
      status: BankTransferRequestStatus.WAITING,
      matched_transaction_id: null,
      confirmed_by: null,
      created_by: null,
      created_at: new Date('2026-09-10T16:00:00Z'),
      resolved_at: null,
      ...overrides,
    };
  }

  function makeTransaction(overrides: Partial<BankTransactionRow> = {}): BankTransactionRow {
    return {
      id: 'transaction-1',
      source: BankTransactionSource.BANCOLOMBIA_EMAIL,
      external_id: 'msg-1',
      amount: '38500.00',
      received_at: new Date('2026-09-10T16:05:00Z'),
      reference: null,
      status: BankTransactionStatus.PENDING,
      matched_order_id: null,
      raw_metadata: {},
      created_at: new Date('2026-09-10T16:05:00Z'),
      updated_at: new Date('2026-09-10T16:05:00Z'),
      ...overrides,
    };
  }

  beforeEach(() => {
    transactionsRepository = {
      findCandidatesByAmountWindow: jest.fn().mockResolvedValue([]),
      claimForOrder: jest.fn(),
      markReviewRequired: jest.fn(),
      release: jest.fn(),
    };
    requestsRepository = { claim: jest.fn(), release: jest.fn() };
    ordersService = {
      getOwnedOrFail: jest.fn().mockResolvedValue({ id: orderId, business_id: businessId, order_number: '0910-01' }),
    };
    paymentsService = { create: jest.fn() };
    auditService = { record: jest.fn() };
    configService = {
      getOrThrow: jest.fn().mockReturnValue({
        bankVerification: { matchWindowMinutes: 120, matchBackwardToleranceMinutes: 5 },
      }),
    };
    service = new PaymentMatchingService(
      transactionsRepository as never,
      requestsRepository as never,
      ordersService as never,
      paymentsService as never,
      auditService as never,
      configService as never,
    );
  });

  describe('attemptMatchForRequest', () => {
    it('scenario 1: confirms a correct single-candidate match and registers the payment', async () => {
      const request = makeRequest();
      const transaction = makeTransaction();
      transactionsRepository.findCandidatesByAmountWindow.mockResolvedValue([transaction]);
      transactionsRepository.claimForOrder.mockResolvedValue(transaction);
      requestsRepository.claim.mockResolvedValue(request);
      paymentsService.create.mockResolvedValue({ id: 'payment-1', amount: 38500 });

      const outcome = await service.attemptMatchForRequest(request);

      expect(outcome).toBe('MATCHED');
      expect(paymentsService.create).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({ orderId, paymentMethod: PaymentMethod.TRANSFER, amount: 38500 }),
        undefined,
      );
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'AUTO_MATCH' }),
      );
    });

    it('scenario 2: no candidates when the amount does not match (wrong-amount transfer)', async () => {
      transactionsRepository.findCandidatesByAmountWindow.mockResolvedValue([]);

      const outcome = await service.attemptMatchForRequest(makeRequest());

      expect(outcome).toBe('NO_MATCH');
      expect(paymentsService.create).not.toHaveBeenCalled();
    });

    it('scenario 4: a transaction already claimed by another order is not reused (lost race)', async () => {
      const request = makeRequest();
      const transaction = makeTransaction();
      transactionsRepository.findCandidatesByAmountWindow.mockResolvedValue([transaction]);
      transactionsRepository.claimForOrder.mockResolvedValue(null); // someone else claimed it first

      const outcome = await service.attemptMatchForRequest(request);

      expect(outcome).toBe('NO_MATCH');
      expect(paymentsService.create).not.toHaveBeenCalled();
    });

    it('scenario 5/8: two equal-amount candidates with no reference are left for manual review, never auto-confirmed', async () => {
      const request = makeRequest();
      const candidateA = makeTransaction({ id: 'tx-a' });
      const candidateB = makeTransaction({ id: 'tx-b' });
      transactionsRepository.findCandidatesByAmountWindow.mockResolvedValue([candidateA, candidateB]);

      const outcome = await service.attemptMatchForRequest(request);

      expect(outcome).toBe('REVIEW_REQUIRED');
      expect(transactionsRepository.markReviewRequired).toHaveBeenCalledWith('tx-a');
      expect(transactionsRepository.markReviewRequired).toHaveBeenCalledWith('tx-b');
      expect(paymentsService.create).not.toHaveBeenCalled();
      expect(transactionsRepository.claimForOrder).not.toHaveBeenCalled();
    });

    it('a reference matching the order number disambiguates even with multiple amount-only candidates', async () => {
      const request = makeRequest();
      const wrongOne = makeTransaction({ id: 'tx-wrong', reference: null });
      const rightOne = makeTransaction({ id: 'tx-right', reference: 'Pedido 0910-01 ref' });
      transactionsRepository.findCandidatesByAmountWindow.mockResolvedValue([wrongOne, rightOne]);
      transactionsRepository.claimForOrder.mockResolvedValue(rightOne);
      requestsRepository.claim.mockResolvedValue(request);
      paymentsService.create.mockResolvedValue({ id: 'payment-1', amount: 38500 });

      const outcome = await service.attemptMatchForRequest(request);

      expect(outcome).toBe('MATCHED');
      expect(transactionsRepository.claimForOrder).toHaveBeenCalledWith('tx-right', orderId);
    });

    it('rolls back the claim if PaymentsService.create() fails after claiming', async () => {
      const request = makeRequest();
      const transaction = makeTransaction();
      transactionsRepository.findCandidatesByAmountWindow.mockResolvedValue([transaction]);
      transactionsRepository.claimForOrder.mockResolvedValue(transaction);
      requestsRepository.claim.mockResolvedValue(request);
      paymentsService.create.mockRejectedValue(new Error('boom'));

      await expect(service.attemptMatchForRequest(request)).rejects.toThrow('boom');

      expect(transactionsRepository.release).toHaveBeenCalledWith(transaction.id, transaction.status);
      expect(requestsRepository.release).toHaveBeenCalledWith(request.id);
    });
  });

  describe('confirmManualMatch (scenario 10: manual confirmation)', () => {
    it('confirms the cashier-picked transaction and audits it as MANUAL_MATCH', async () => {
      const request = makeRequest();
      const transaction = makeTransaction({ status: BankTransactionStatus.REVIEW_REQUIRED });
      transactionsRepository.claimForOrder.mockResolvedValue(transaction);
      requestsRepository.claim.mockResolvedValue(request);
      paymentsService.create.mockResolvedValue({ id: 'payment-1', amount: 38500 });

      const confirmed = await service.confirmManualMatch(request, transaction, 'cashier-1');

      expect(confirmed).toBe(true);
      expect(requestsRepository.claim).toHaveBeenCalledWith(request.id, transaction.id, 'cashier-1');
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MANUAL_MATCH', userId: 'cashier-1' }),
      );
    });

    it('scenario 3/4: rejects confirming a transaction someone else already used', async () => {
      const request = makeRequest();
      const transaction = makeTransaction({ status: BankTransactionStatus.REVIEW_REQUIRED });
      transactionsRepository.claimForOrder.mockResolvedValue(null);

      const confirmed = await service.confirmManualMatch(request, transaction, 'cashier-1');

      expect(confirmed).toBe(false);
      expect(paymentsService.create).not.toHaveBeenCalled();
    });
  });
});
