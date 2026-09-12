import 'reflect-metadata';
import { Type, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = '*';

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD: string = '';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  DB_POOL_MAX: number = 10;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  DB_IDLE_TIMEOUT_MS: number = 30000;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  DB_CONNECTION_TIMEOUT_MS: number = 5000;

  @IsString()
  @IsOptional()
  DB_SSL: string = 'false';

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsUUID()
  @IsNotEmpty()
  CAR_SERVICE_BUSINESS_ID: string;

  @IsUUID()
  @IsNotEmpty()
  CAR_SERVICE_BRANCH_ID: string;

  @IsString()
  @IsOptional()
  BANK_VERIFICATION_ENABLED: string = 'false';

  @IsIn(['mock', 'gmail'])
  @IsOptional()
  BANK_VERIFICATION_PROVIDER: string = 'mock';

  @IsString()
  @IsOptional()
  BANK_VERIFICATION_BUSINESS_ID: string = '';

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @IsOptional()
  BANK_VERIFICATION_POLL_INTERVAL_MS: number = 30000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  BANK_VERIFICATION_MATCH_WINDOW_MINUTES: number = 120;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  BANK_VERIFICATION_MATCH_BACKWARD_TOLERANCE_MINUTES: number = 5;

  @IsString()
  @IsOptional()
  BANK_EMAIL_SENDER_ALLOWLIST: string = '';

  @IsString()
  @IsOptional()
  BANK_EMAIL_SUBJECT_FILTER: string = '';

  @IsString()
  @IsOptional()
  GMAIL_OAUTH_CLIENT_ID: string = '';

  @IsString()
  @IsOptional()
  GMAIL_OAUTH_CLIENT_SECRET: string = '';

  @IsString()
  @IsOptional()
  GMAIL_OAUTH_REFRESH_TOKEN: string = '';

  @IsString()
  @IsOptional()
  GMAIL_OAUTH_REDIRECT_URI: string = 'http://localhost:3000/oauth2callback';
}

export function validate(config: Record<string, unknown>) {
  // Explicit @Type() decorators drive the numeric conversion below, rather
  // than class-transformer's implicit (reflect-metadata-based) conversion:
  // esbuild-based runners (tsx, used by our npm scripts) never emit
  // TypeScript's decorator type metadata, so implicit conversion silently
  // fails outside a full tsc/ts-jest/ts-node compile.
  const validatedConfig = plainToInstance(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validatedConfig;
}
