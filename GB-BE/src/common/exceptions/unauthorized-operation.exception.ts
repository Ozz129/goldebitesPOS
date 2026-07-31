import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class UnauthorizedOperationException extends DomainException {
  constructor(
    message = 'You are not authorized to perform this operation',
    details?: Record<string, unknown>,
  ) {
    super({
      code: 'UNAUTHORIZED_OPERATION',
      message,
      status: HttpStatus.FORBIDDEN,
      details,
    });
  }
}
