import databaseConfig from './database.config';

describe('databaseConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back to sensible defaults when env vars are absent', () => {
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_POOL_MAX;
    delete process.env.DB_SSL;

    const config = databaseConfig();

    expect(config).toEqual(
      expect.objectContaining({
        host: 'localhost',
        port: 5432,
        poolMax: 10,
        ssl: false,
      }),
    );
  });

  it('reads and coerces values from the environment', () => {
    process.env.DB_HOST = 'db.internal';
    process.env.DB_PORT = '6543';
    process.env.DB_NAME = 'golden_bites';
    process.env.DB_USER = 'gb_user';
    process.env.DB_PASSWORD = 'secret';
    process.env.DB_POOL_MAX = '25';
    process.env.DB_SSL = 'true';

    const config = databaseConfig();

    expect(config.host).toBe('db.internal');
    expect(config.port).toBe(6543);
    expect(config.database).toBe('golden_bites');
    expect(config.user).toBe('gb_user');
    expect(config.password).toBe('secret');
    expect(config.poolMax).toBe(25);
    expect(config.ssl).toBe(true);
  });
});
