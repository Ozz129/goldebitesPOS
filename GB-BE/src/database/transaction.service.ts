import { Inject, Injectable, Logger } from '@nestjs/common';
import { PoolClient } from 'pg';
import { PG_POOL } from './database.service';
import { Pool } from 'pg';

export type TransactionWork<T> = (client: PoolClient) => Promise<T>;

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /**
   * Runs `work` inside a single BEGIN/COMMIT block, rolling back on any
   * thrown error. All repository calls inside `work` must reuse the
   * provided client to stay within the same transaction.
   */
  async execute<T>(work: TransactionWork<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        this.logger.error(
          'Failed to rollback transaction',
          rollbackError instanceof Error ? rollbackError.stack : undefined,
        );
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
