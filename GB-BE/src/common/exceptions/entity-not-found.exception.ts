import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier?: string | number) {
    super({
      code: 'ENTITY_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      message: identifier
        ? `${entityName} with id "${identifier}" was not found`
        : `${entityName} was not found`,
      details: { entityName, identifier },
    });
  }
}
