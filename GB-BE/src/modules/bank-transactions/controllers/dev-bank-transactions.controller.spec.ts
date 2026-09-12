import { NotFoundException } from '@nestjs/common';
import { DevBankTransactionsController } from './dev-bank-transactions.controller';

describe('DevBankTransactionsController', () => {
  let mockProvider: { simulate: jest.Mock };
  let ingestionService: { runIngestionTick: jest.Mock };
  let configService: { getOrThrow: jest.Mock };
  let controller: DevBankTransactionsController;

  beforeEach(() => {
    mockProvider = { simulate: jest.fn() };
    ingestionService = { runIngestionTick: jest.fn().mockResolvedValue(undefined) };
    configService = { getOrThrow: jest.fn().mockReturnValue({ nodeEnv: 'development' }) };
    controller = new DevBankTransactionsController(
      mockProvider as never,
      ingestionService as never,
      configService as never,
    );
  });

  it('simulates a transaction and runs matching immediately in non-production', async () => {
    const result = await controller.simulate({ amount: 38500 });

    expect(mockProvider.simulate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 38500, reference: undefined }),
    );
    expect(ingestionService.runIngestionTick).toHaveBeenCalled();
    expect(result).toEqual({ simulated: true });
  });

  it('is hard-blocked in production even if somehow reached', async () => {
    configService.getOrThrow.mockReturnValue({ nodeEnv: 'production' });

    await expect(controller.simulate({ amount: 38500 })).rejects.toThrow(NotFoundException);
    expect(mockProvider.simulate).not.toHaveBeenCalled();
  });
});
