import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions';
import {
  BankTransactionRow,
  BankTransactionSource,
  BankTransactionStatus,
  BankTransferRequestRow,
  BankTransferRequestStatus,
} from '../domain/bank-transaction.types';
import { BankTransferRequestsService } from './bank-transfer-requests.service';

describe('BankTransferRequestsService', () => {
  let requestsRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findActiveByOrder: jest.Mock;
    findLatestByOrder: jest.Mock;
    cancel: jest.Mock;
  };
  let transactionsRepository: { findById: jest.Mock; findCandidatesByAmountWindow: jest.Mock };
  let ordersService: { getOwnedOrFail: jest.Mock };
  let paymentsService: { findByOrder: jest.Mock };
  let matchingService: { attemptMatchForRequest: jest.Mock; confirmManualMatch: jest.Mock };
  let ingestionService: { runIngestionTick: jest.Mock };
  let configService: { getOrThrow: jest.Mock };
  let service: BankTransferRequestsService;

  const businessId = 'business-1';
  const orderId = 'order-1';

  function makeRequest(overrides: Partial<BankTransferRequestRow> = {}): BankTransferRequestRow {
    return {
      id: 'request-1',
      business_id: businessId,
      order_id: orderId,
      amount_expected: '10000.00',
      status: BankTransferRequestStatus.WAITING,
      matched_transaction_id: null,
      confirmed_by: null,
      created_by: null,
      created_at: new Date(),
      resolved_at: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    requestsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findActiveByOrder: jest.fn().mockResolvedValue(null),
      findLatestByOrder: jest.fn().mockResolvedValue(null),
      cancel: jest.fn(),
    };
    transactionsRepository = {
      findById: jest.fn(),
      findCandidatesByAmountWindow: jest.fn().mockResolvedValue([]),
    };
    ordersService = {
      getOwnedOrFail: jest.fn().mockResolvedValue({
        id: orderId,
        business_id: businessId,
        status: 'PENDING',
        total_amount: '10000.00',
      }),
    };
    paymentsService = { findByOrder: jest.fn().mockResolvedValue([]) };
    matchingService = { attemptMatchForRequest: jest.fn(), confirmManualMatch: jest.fn() };
    ingestionService = { runIngestionTick: jest.fn().mockResolvedValue(undefined) };
    configService = {
      getOrThrow: jest.fn().mockReturnValue({
        bankVerification: { matchWindowMinutes: 120, matchBackwardToleranceMinutes: 5 },
      }),
    };
    service = new BankTransferRequestsService(
      requestsRepository as never,
      transactionsRepository as never,
      ordersService as never,
      paymentsService as never,
      matchingService as never,
      ingestionService as never,
      configService as never,
    );
  });

  describe('start', () => {
    it('rejects when the order is cancelled', async () => {
      ordersService.getOwnedOrFail.mockResolvedValue({ id: orderId, business_id: businessId, status: 'CANCELLED', total_amount: '10000.00' });
      await expect(service.start(businessId, orderId, 'actor-1')).rejects.toThrow(BusinessRuleException);
    });

    it('rejects when the order has no pending balance', async () => {
      paymentsService.findByOrder.mockResolvedValue([{ amount: 10000 }]);
      await expect(service.start(businessId, orderId, 'actor-1')).rejects.toThrow(BusinessRuleException);
      expect(requestsRepository.create).not.toHaveBeenCalled();
    });

    it('creates a WAITING request for the balance due and attempts an immediate match', async () => {
      const created = makeRequest();
      requestsRepository.create.mockResolvedValue(created);
      requestsRepository.findById.mockResolvedValue(created);

      const result = await service.start(businessId, orderId, 'actor-1');

      expect(requestsRepository.create).toHaveBeenCalledWith(
        { businessId, orderId, amountExpected: 10000 },
        'actor-1',
      );
      expect(matchingService.attemptMatchForRequest).toHaveBeenCalledWith(created);
      expect(result.state).toBe('WAITING');
    });

    it('returns the existing WAITING request instead of creating a second one', async () => {
      const existing = makeRequest();
      requestsRepository.findActiveByOrder.mockResolvedValue(existing);

      const result = await service.start(businessId, orderId, 'actor-1');

      expect(requestsRepository.create).not.toHaveBeenCalled();
      expect(result.state).toBe('WAITING');
    });
  });

  describe('getStatus', () => {
    it('reports NONE when no request has ever been created for this order', async () => {
      const result = await service.getStatus(businessId, orderId);
      expect(result).toEqual({ state: 'NONE' });
    });

    it('reports MATCHED once the request is resolved', async () => {
      requestsRepository.findLatestByOrder.mockResolvedValue(makeRequest({ status: BankTransferRequestStatus.MATCHED }));
      const result = await service.getStatus(businessId, orderId);
      expect(result.state).toBe('MATCHED');
    });

    it('surfaces REVIEW_REQUIRED candidates while still WAITING', async () => {
      requestsRepository.findLatestByOrder.mockResolvedValue(makeRequest());
      const candidate: BankTransactionRow = {
        id: 'tx-1',
        source: BankTransactionSource.BANCOLOMBIA_EMAIL,
        external_id: 'msg-1',
        amount: '10000.00',
        received_at: new Date(),
        reference: null,
        status: BankTransactionStatus.REVIEW_REQUIRED,
        matched_order_id: null,
        raw_metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };
      transactionsRepository.findCandidatesByAmountWindow.mockResolvedValue([candidate]);

      const result = await service.getStatus(businessId, orderId);

      expect(result.state).toBe('WAITING');
      if (result.state === 'WAITING') {
        expect(result.reviewCandidates).toHaveLength(1);
        expect(result.reviewCandidates[0].transactionId).toBe('tx-1');
      }
    });
  });

  describe('recheck', () => {
    it('forces an ingestion tick before reporting status', async () => {
      requestsRepository.findLatestByOrder.mockResolvedValue(makeRequest({ status: BankTransferRequestStatus.MATCHED }));
      const result = await service.recheck(businessId, orderId);
      expect(ingestionService.runIngestionTick).toHaveBeenCalled();
      expect(result.state).toBe('MATCHED');
    });
  });

  describe('cancel', () => {
    it('cancels the active WAITING request', async () => {
      const active = makeRequest();
      requestsRepository.findActiveByOrder.mockResolvedValue(active);
      requestsRepository.cancel.mockResolvedValue(makeRequest({ status: BankTransferRequestStatus.CANCELLED }));

      const result = await service.cancel(businessId, orderId);

      expect(requestsRepository.cancel).toHaveBeenCalledWith(active.id);
      expect(result.state).toBe('NONE');
    });
  });

  describe('confirmManual', () => {
    it('rejects an unknown or already-used transaction', async () => {
      requestsRepository.findActiveByOrder.mockResolvedValue(makeRequest());
      transactionsRepository.findById.mockResolvedValue({ id: 'tx-1', status: 'MATCHED' });

      await expect(
        service.confirmManual(businessId, orderId, 'tx-1', 'actor-1'),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('rejects when there is no active request to confirm', async () => {
      requestsRepository.findActiveByOrder.mockResolvedValue(null);
      await expect(
        service.confirmManual(businessId, orderId, 'tx-1', 'actor-1'),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('confirms the chosen transaction when matchingService succeeds', async () => {
      const active = makeRequest();
      requestsRepository.findActiveByOrder.mockResolvedValue(active);
      transactionsRepository.findById.mockResolvedValue({ id: 'tx-1', status: 'REVIEW_REQUIRED' });
      matchingService.confirmManualMatch.mockResolvedValue(true);
      requestsRepository.findById.mockResolvedValue(makeRequest({ status: BankTransferRequestStatus.MATCHED }));

      const result = await service.confirmManual(businessId, orderId, 'tx-1', 'actor-1');

      expect(matchingService.confirmManualMatch).toHaveBeenCalledWith(active, { id: 'tx-1', status: 'REVIEW_REQUIRED' }, 'actor-1');
      expect(result.state).toBe('MATCHED');
    });

    it('raises a business error when the transaction was claimed by someone else in the meantime', async () => {
      const active = makeRequest();
      requestsRepository.findActiveByOrder.mockResolvedValue(active);
      transactionsRepository.findById.mockResolvedValue({ id: 'tx-1', status: 'REVIEW_REQUIRED' });
      matchingService.confirmManualMatch.mockResolvedValue(false);

      await expect(
        service.confirmManual(businessId, orderId, 'tx-1', 'actor-1'),
      ).rejects.toThrow(BusinessRuleException);
    });
  });
});
