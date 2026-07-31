import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import {
  CreatePasswordResetTokenData,
  IPasswordResetTokenRepository,
  PasswordResetTokenRow,
} from './password-reset-token.repository.interface';

@Injectable()
export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreatePasswordResetTokenData,
    client?: DbClient,
  ): Promise<PasswordResetTokenRow> {
    const result = await this.db.query<PasswordResetTokenRow>(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, token_hash, expires_at, used_at, created_at`,
      [data.userId, data.tokenHash, data.expiresAt],
      client,
    );
    return result.rows[0];
  }

  async findByTokenHash(
    tokenHash: string,
    client?: DbClient,
  ): Promise<PasswordResetTokenRow | null> {
    const result = await this.db.query<PasswordResetTokenRow>(
      `SELECT id, user_id, token_hash, expires_at, used_at, created_at
       FROM password_reset_tokens
       WHERE token_hash = $1`,
      [tokenHash],
      client,
    );
    return result.rows[0] ?? null;
  }

  async markUsed(id: string, client?: DbClient): Promise<void> {
    await this.db.query(
      'UPDATE password_reset_tokens SET used_at = now() WHERE id = $1',
      [id],
      client,
    );
  }
}
