import appConfig from './app.config';

describe('appConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back to sensible defaults when env vars are absent', () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.API_PREFIX;
    delete process.env.CORS_ORIGIN;

    const config = appConfig();

    expect(config).toEqual(
      expect.objectContaining({
        nodeEnv: 'development',
        port: 3000,
        apiPrefix: 'api/v1',
        corsOrigin: '*',
      }),
    );
  });

  it('reads values from the environment when present', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4000';
    process.env.API_PREFIX = 'api/v2';
    process.env.CORS_ORIGIN = 'https://goldenbites.example';
    process.env.JWT_ACCESS_SECRET = 'access';
    process.env.JWT_REFRESH_SECRET = 'refresh';

    const config = appConfig();

    expect(config.nodeEnv).toBe('production');
    expect(config.port).toBe(4000);
    expect(config.apiPrefix).toBe('api/v2');
    expect(config.corsOrigin).toBe('https://goldenbites.example');
    expect(config.jwt.accessSecret).toBe('access');
    expect(config.jwt.refreshSecret).toBe('refresh');
  });
});
