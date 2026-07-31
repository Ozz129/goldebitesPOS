import { DbClient } from '../../../database/types/database.types';

export interface PasswordResetTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export interface CreatePasswordResetTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface IPasswordResetTokenRepository {
  create(
    data: CreatePasswordResetTokenData,
    client?: DbClient,
  ): Promise<PasswordResetTokenRow>;
  findByTokenHash(
    tokenHash: string,
    client?: DbClient,
  ): Promise<PasswordResetTokenRow | null>;
  markUsed(id: string, client?: DbClient): Promise<void>;
}

export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol(
  'PASSWORD_RESET_TOKEN_REPOSITORY',
);
