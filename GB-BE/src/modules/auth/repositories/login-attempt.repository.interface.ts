export interface RecordLoginAttemptData {
  email: string;
  userId?: string | null;
  success: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ILoginAttemptRepository {
  record(data: RecordLoginAttemptData): Promise<void>;
}

export const LOGIN_ATTEMPT_REPOSITORY = Symbol('LOGIN_ATTEMPT_REPOSITORY');
