import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

/**
 * Generic violation of a domain invariant that doesn't warrant a more
 * specific exception type. Prefer a dedicated exception when one exists.
 */
export class BusinessRuleException extends DomainException {
  constructor(
    message: string,
    code = 'BUSINESS_RULE_VIOLATION',
    details?: Record<string, unknown>,
  ) {
    super({ code, message, status: HttpStatus.UNPROCESSABLE_ENTITY, details });
  }
}
