import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class CashSessionClosedException extends DomainException {
  constructor(cashSessionId?: string) {
    super({
      code: 'CASH_SESSION_CLOSED',
      message: 'The cash session is closed and cannot be modified',
      status: HttpStatus.CONFLICT,
      details: { cashSessionId },
    });
  }
}
