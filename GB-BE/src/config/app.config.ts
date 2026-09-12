import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigin: string;
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  carService: {
    businessId: string;
    branchId: string;
  };
  bankVerification: {
    enabled: boolean;
    provider: 'mock' | 'gmail';
    businessId: string;
    pollIntervalMs: number;
    matchWindowMinutes: number;
    matchBackwardToleranceMinutes: number;
    senderAllowlist: string[];
    subjectFilter: string | null;
    gmail: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      redirectUri: string;
    };
  };
}

export default registerAs('app', (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  carService: {
    // Public, unauthenticated kiosk endpoints (see tablet-kiosk module) have
    // no JWT to read a businessId/branchId from, so this single-tenant
    // deployment fixes both here instead of trusting the client.
    businessId: process.env.CAR_SERVICE_BUSINESS_ID ?? '',
    branchId: process.env.CAR_SERVICE_BRANCH_ID ?? '',
  },
  bankVerification: {
    enabled: process.env.BANK_VERIFICATION_ENABLED === 'true',
    provider: (process.env.BANK_VERIFICATION_PROVIDER as 'mock' | 'gmail' | undefined) ?? 'mock',
    businessId: process.env.BANK_VERIFICATION_BUSINESS_ID ?? '',
    pollIntervalMs: parseInt(process.env.BANK_VERIFICATION_POLL_INTERVAL_MS ?? '30000', 10),
    matchWindowMinutes: parseInt(process.env.BANK_VERIFICATION_MATCH_WINDOW_MINUTES ?? '120', 10),
    matchBackwardToleranceMinutes: parseInt(
      process.env.BANK_VERIFICATION_MATCH_BACKWARD_TOLERANCE_MINUTES ?? '5',
      10,
    ),
    senderAllowlist: (process.env.BANK_EMAIL_SENDER_ALLOWLIST ?? '')
      .split(',')
      .map((address) => address.trim())
      .filter(Boolean),
    subjectFilter: process.env.BANK_EMAIL_SUBJECT_FILTER || null,
    gmail: {
      clientId: process.env.GMAIL_OAUTH_CLIENT_ID ?? '',
      clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET ?? '',
      refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN ?? '',
      redirectUri: process.env.GMAIL_OAUTH_REDIRECT_URI ?? 'http://localhost:3000/oauth2callback',
    },
  },
}));
