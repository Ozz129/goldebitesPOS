import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import {
  ILoginAttemptRepository,
  RecordLoginAttemptData,
} from './login-attempt.repository.interface';

@Injectable()
export class LoginAttemptRepository implements ILoginAttemptRepository {
  private readonly logger = new Logger(LoginAttemptRepository.name);

  constructor(private readonly db: DatabaseService) {}

  /** Best-effort: a failure here must never block the login flow itself. */
  async record(data: RecordLoginAttemptData): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO login_attempts (email, user_id, success, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          data.email,
          data.userId ?? null,
          data.success,
          data.ipAddress ?? null,
          data.userAgent ?? null,
        ],
      );
    } catch (error) {
      this.logger.error(
        'Failed to record login attempt',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
