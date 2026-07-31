import { HttpException, HttpStatus } from '@nestjs/common';

export interface DomainExceptionOptions {
  code: string;
  message: string;
  status?: HttpStatus;
  details?: Record<string, unknown>;
}

/**
 * Base class for business/domain errors. Carries a stable machine-readable
 * `code` (used by clients) separate from the human-readable `message`.
 */
export class DomainException extends HttpException {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(options: DomainExceptionOptions) {
    const status = options.status ?? HttpStatus.BAD_REQUEST;
    super({ message: options.message, code: options.code }, status);
    this.code = options.code;
    this.details = options.details;
  }
}
