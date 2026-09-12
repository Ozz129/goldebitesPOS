import { BankTransactionIngestionService } from './bank-transaction-ingestion.service';

describe('BankTransactionIngestionService', () => {
  let provider: { fetchNewTransactions: jest.Mock };
  let transactionsRepository: { insertIfNew: jest.Mock };
  let requestsRepository: { findWaitingForBusiness: jest.Mock };
  let matchingService: { attemptMatchForRequest: jest.Mock };
  let configService: { getOrThrow: jest.Mock };
  let service: BankTransactionIngestionService;

  const businessId = 'business-1';

  beforeEach(() => {
    provider = { fetchNewTransactions: jest.fn().mockResolvedValue([]) };
    transactionsRepository = { insertIfNew: jest.fn() };
    requestsRepository = { findWaitingForBusiness: jest.fn().mockResolvedValue([]) };
    matchingService = { attemptMatchForRequest: jest.fn() };
    configService = {
      getOrThrow: jest.fn().mockReturnValue({
        bankVerification: { enabled: true, businessId, pollIntervalMs: 30000 },
      }),
    };
    service = new BankTransactionIngestionService(
      provider as never,
      transactionsRepository as never,
      requestsRepository as never,
      matchingService as never,
      configService as never,
    );
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  it('inserts every fetched transaction and matches all WAITING requests for the configured business', async () => {
    provider.fetchNewTransactions.mockResolvedValue([
      { externalId: 'msg-1', amount: 10000, receivedAt: new Date(), reference: null, source: 'BANCOLOMBIA_EMAIL', rawMetadata: {} },
    ]);
    requestsRepository.findWaitingForBusiness.mockResolvedValue([{ id: 'request-1' }]);

    await service.runIngestionTick();

    expect(transactionsRepository.insertIfNew).toHaveBeenCalledTimes(1);
    expect(matchingService.attemptMatchForRequest).toHaveBeenCalledWith({ id: 'request-1' });
  });

  it('scenario 6: a duplicate notification is inserted idempotently — insertIfNew is still called but a real DB no-ops on conflict', async () => {
    provider.fetchNewTransactions.mockResolvedValue([
      { externalId: 'msg-1', amount: 10000, receivedAt: new Date(), reference: null, source: 'BANCOLOMBIA_EMAIL', rawMetadata: {} },
      { externalId: 'msg-1', amount: 10000, receivedAt: new Date(), reference: null, source: 'BANCOLOMBIA_EMAIL', rawMetadata: {} },
    ]);
    transactionsRepository.insertIfNew.mockResolvedValueOnce({ id: 'tx-1' }).mockResolvedValueOnce(null);

    await service.runIngestionTick();

    expect(transactionsRepository.insertIfNew).toHaveBeenCalledTimes(2);
  });

  it('scenario 9: a provider failure propagates without silently ingesting a partial batch as "checked"', async () => {
    provider.fetchNewTransactions.mockRejectedValue(new Error('Gmail API unavailable'));

    await expect(service.runIngestionTick()).rejects.toThrow('Gmail API unavailable');
    expect(transactionsRepository.insertIfNew).not.toHaveBeenCalled();
  });

  it('does nothing when no business is configured to match against', async () => {
    configService.getOrThrow.mockReturnValue({
      bankVerification: { enabled: true, businessId: '', pollIntervalMs: 30000 },
    });

    await service.runIngestionTick();

    expect(requestsRepository.findWaitingForBusiness).not.toHaveBeenCalled();
  });

  it('does not schedule a background tick when disabled', () => {
    configService.getOrThrow.mockReturnValue({
      bankVerification: { enabled: false, businessId, pollIntervalMs: 30000 },
    });
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    service.onModuleInit();

    expect(setIntervalSpy).not.toHaveBeenCalled();
    setIntervalSpy.mockRestore();
  });
});
