import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class InsufficientStockException extends DomainException {
  constructor(inventoryItemName: string, available: number, requested: number) {
    super({
      code: 'INSUFFICIENT_STOCK',
      message: `Insufficient stock for "${inventoryItemName}": available ${available}, requested ${requested}`,
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      details: { inventoryItemName, available, requested },
    });
  }
}
