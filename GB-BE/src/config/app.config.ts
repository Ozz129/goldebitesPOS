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
  wompi: {
    enabled: boolean;
    publicKey: string;
    privateKey: string;
    integritySecret: string;
    eventsSecret: string;
    baseUrl: string;
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
  wompi: {
    enabled: process.env.WOMPI_PAYMENTS_ENABLED === 'true',
    publicKey: process.env.WOMPI_PUBLIC_KEY ?? '',
    privateKey: process.env.WOMPI_PRIVATE_KEY ?? '',
    integritySecret: process.env.WOMPI_INTEGRITY_SECRET ?? '',
    eventsSecret: process.env.WOMPI_EVENTS_SECRET ?? '',
    baseUrl: process.env.WOMPI_BASE_URL ?? 'https://sandbox.wompi.co/v1',
  },
}));
