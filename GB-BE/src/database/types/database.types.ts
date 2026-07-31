import { PoolClient, QueryResultRow } from 'pg';

export type QueryParams = ReadonlyArray<unknown>;

export interface QueryResult<T extends QueryResultRow = QueryResultRow> {
  rows: T[];
  rowCount: number;
}

export interface HealthCheckResult {
  connected: boolean;
  latencyMs: number;
  error?: string;
}

export type DbClient = PoolClient;

/**
 * Repositories accept an optional client so services can run multiple
 * repository calls inside the same TransactionService.execute() block.
 */
export type QueryRunner = DbClient | undefined;
