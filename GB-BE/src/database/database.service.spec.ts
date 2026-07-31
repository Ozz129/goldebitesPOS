import { DatabaseService } from './database.service';

function createMockPool() {
  return {
    on: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
    query: jest.fn(),
    connect: jest.fn(),
  };
}

describe('DatabaseService', () => {
  let pool: ReturnType<typeof createMockPool>;
  let service: DatabaseService;

  beforeEach(() => {
    pool = createMockPool();
    service = new DatabaseService(pool as never);
    service.onModuleInit();
  });

  it('registers an error handler on the pool to avoid crashing on idle client errors', () => {
    expect(pool.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('query() delegates to the pool with parameterized values and normalizes the result', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 });

    const result = await service.query(
      'SELECT * FROM products WHERE id = $1',
      [1],
    );

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM products WHERE id = $1',
      [1],
    );
    expect(result).toEqual({ rows: [{ id: 1 }], rowCount: 1 });
  });

  it('query() uses the provided client instead of the pool when given one (transaction support)', async () => {
    const client = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    };

    await service.query('SELECT 1', [], client as never);

    expect(client.query).toHaveBeenCalledWith('SELECT 1', []);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('getClient() checks out a client from the pool', async () => {
    const client = { release: jest.fn() };
    pool.connect.mockResolvedValue(client);

    const result = await service.getClient();

    expect(result).toBe(client);
  });

  it('healthCheck() reports connected=true when the query succeeds', async () => {
    pool.query.mockResolvedValue({ rows: [{ '?column?': 1 }], rowCount: 1 });

    const health = await service.healthCheck();

    expect(health.connected).toBe(true);
    expect(typeof health.latencyMs).toBe('number');
  });

  it('healthCheck() reports connected=false and the error message on failure', async () => {
    pool.query.mockRejectedValue(new Error('connection refused'));

    const health = await service.healthCheck();

    expect(health.connected).toBe(false);
    expect(health.error).toBe('connection refused');
  });

  it('onModuleDestroy() closes the pool', async () => {
    await service.onModuleDestroy();
    expect(pool.end).toHaveBeenCalled();
  });
});
