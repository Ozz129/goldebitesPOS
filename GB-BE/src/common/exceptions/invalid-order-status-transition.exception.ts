import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class InvalidOrderStatusTransitionException extends DomainException {
  constructor(from: string, to: string) {
    super({
      code: 'ORDER_INVALID_STATUS_TRANSITION',
      message: `Cannot transition order from "${from}" to "${to}"`,
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      details: { from, to },
    });
  }
}
