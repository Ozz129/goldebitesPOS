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

  it('defaults bank verification to disabled/mock and parses the sender allowlist', () => {
    delete process.env.BANK_VERIFICATION_ENABLED;
    delete process.env.BANK_VERIFICATION_PROVIDER;
    delete process.env.BANK_EMAIL_SENDER_ALLOWLIST;

    const config = appConfig();

    expect(config.bankVerification.enabled).toBe(false);
    expect(config.bankVerification.provider).toBe('mock');
    expect(config.bankVerification.senderAllowlist).toEqual([]);
  });

  it('reads bank verification config from the environment exactly, never defaulting enabled to true', () => {
    process.env.BANK_VERIFICATION_ENABLED = 'true';
    process.env.BANK_VERIFICATION_PROVIDER = 'gmail';
    process.env.BANK_VERIFICATION_BUSINESS_ID = 'business-1';
    process.env.BANK_EMAIL_SENDER_ALLOWLIST = 'alertas@bancolombia.com.co, otro@bancolombia.com.co';

    const config = appConfig();

    expect(config.bankVerification.enabled).toBe(true);
    expect(config.bankVerification.provider).toBe('gmail');
    expect(config.bankVerification.businessId).toBe('business-1');
    expect(config.bankVerification.senderAllowlist).toEqual([
      'alertas@bancolombia.com.co',
      'otro@bancolombia.com.co',
    ]);
  });
});
