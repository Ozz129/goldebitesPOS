import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResultRow } from 'pg';
import { DatabaseConfig } from '../config/database.config';
import {
  DbClient,
  HealthCheckResult,
  QueryParams,
  QueryResult,
} from './types/database.types';

export const PG_POOL = Symbol('PG_POOL');

export const pgPoolProvider = {
  provide: PG_POOL,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Pool => {
    const dbConfig = configService.getOrThrow<DatabaseConfig>('database');

    return new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      max: dbConfig.poolMax,
      idleTimeoutMillis: dbConfig.idleTimeoutMillis,
      connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
    });
  },
};

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  onModuleInit(): void {
    this.pool.on('error', (err) => {
      this.logger.error(
        'Unexpected error on idle PostgreSQL client',
        err.stack,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: QueryParams,
    client?: DbClient,
  ): Promise<QueryResult<T>> {
    const runner = client ?? this.pool;
    const result = await runner.query<T>(text, params as unknown[]);
    return { rows: result.rows, rowCount: result.rowCount ?? 0 };
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  getPool(): Pool {
    return this.pool;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      return { connected: true, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        connected: false,
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
