import { TransactionService } from './transaction.service';

function createMockClient() {
  return {
    query: jest.fn().mockResolvedValue(undefined),
    release: jest.fn(),
  };
}

describe('TransactionService', () => {
  let client: ReturnType<typeof createMockClient>;
  let pool: { connect: jest.Mock };
  let service: TransactionService;

  beforeEach(() => {
    client = createMockClient();
    pool = { connect: jest.fn().mockResolvedValue(client) };
    service = new TransactionService(pool as never);
  });

  it('wraps work in BEGIN/COMMIT and returns its result', async () => {
    const work = jest.fn().mockResolvedValue('ok');

    const result = await service.execute(work);

    expect(result).toBe('ok');
    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(work).toHaveBeenCalledWith(client);
    expect(client.query).toHaveBeenNthCalledWith(2, 'COMMIT');
    expect(client.release).toHaveBeenCalled();
  });

  it('rolls back and rethrows when work fails', async () => {
    const failure = new Error('insert failed');
    const work = jest.fn().mockRejectedValue(failure);

    await expect(service.execute(work)).rejects.toThrow(failure);

    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(client.query).toHaveBeenNthCalledWith(2, 'ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });

  it('always releases the client back to the pool, even if rollback itself fails', async () => {
    client.query.mockImplementation((sql: string) => {
      if (sql === 'ROLLBACK') {
        return Promise.reject(new Error('rollback failed'));
      }
      return Promise.resolve(undefined);
    });
    const work = jest.fn().mockRejectedValue(new Error('original failure'));

    await expect(service.execute(work)).rejects.toThrow('original failure');

    expect(client.release).toHaveBeenCalled();
  });
});
