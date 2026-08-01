import { validate } from './env.validation';

function validConfig(overrides: Record<string, unknown> = {}) {
  return {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_NAME: 'golden_bites',
    DB_USER: 'golden_bites',
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_REFRESH_SECRET: 'refresh-secret',
    CAR_SERVICE_BUSINESS_ID: '11111111-1111-4111-a111-111111111111',
    CAR_SERVICE_BRANCH_ID: '22222222-2222-4222-a222-222222222222',
    ...overrides,
  };
}

describe('env.validation', () => {
  it('accepts a valid configuration and coerces numeric strings to numbers', () => {
    const result = validate(validConfig({ PORT: '4000', DB_POOL_MAX: '15' }));

    expect(result.PORT).toBe(4000);
    expect(typeof result.PORT).toBe('number');
    expect(result.DB_PORT).toBe(5432);
    expect(result.DB_POOL_MAX).toBe(15);
  });

  it('applies default values for optional fields when absent', () => {
    const result = validate(validConfig());

    expect(result.PORT).toBe(3000);
    expect(result.NODE_ENV).toBe('development');
    expect(result.DB_POOL_MAX).toBe(10);
  });

  it('throws a descriptive error when required fields are missing', () => {
    const config = validConfig();
    delete (config as Record<string, unknown>).DB_HOST;

    expect(() => validate(config)).toThrow(/DB_HOST/);
  });

  it('throws when a numeric field is out of range', () => {
    expect(() => validate(validConfig({ PORT: '999999' }))).toThrow(/PORT/);
  });
});
