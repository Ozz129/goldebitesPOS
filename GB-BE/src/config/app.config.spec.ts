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

  it('keeps Wompi disabled and defaults to the sandbox base URL when unset', () => {
    delete process.env.WOMPI_PAYMENTS_ENABLED;
    delete process.env.WOMPI_BASE_URL;

    const config = appConfig();

    expect(config.wompi.enabled).toBe(false);
    expect(config.wompi.baseUrl).toBe('https://sandbox.wompi.co/v1');
  });

  it('enables Wompi only when the flag is exactly "true"', () => {
    process.env.WOMPI_PAYMENTS_ENABLED = 'yes';
    expect(appConfig().wompi.enabled).toBe(false);

    process.env.WOMPI_PAYMENTS_ENABLED = 'true';
    expect(appConfig().wompi.enabled).toBe(true);
  });
});
