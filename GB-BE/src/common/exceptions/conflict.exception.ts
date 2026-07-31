import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ConflictException extends DomainException {
  constructor(
    message: string,
    code = 'CONFLICT',
    details?: Record<string, unknown>,
  ) {
    super({ code, message, status: HttpStatus.CONFLICT, details });
  }
}
