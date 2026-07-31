import { HttpStatus } from '@nestjs/common';
import {
  BusinessRuleException,
  CashSessionClosedException,
  ConflictException,
  InsufficientStockException,
  InvalidOrderStatusTransitionException,
  UnauthorizedOperationException,
} from './index';

describe('domain exceptions', () => {
  it('BusinessRuleException defaults to 422 with a generic code', () => {
    const error = new BusinessRuleException('Order total must be positive');
    expect(error.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
  });

  it('BusinessRuleException accepts a custom code', () => {
    const error = new BusinessRuleException('msg', 'CUSTOM_CODE');
    expect(error.code).toBe('CUSTOM_CODE');
  });

  it('ConflictException maps to 409', () => {
    const error = new ConflictException('Already exists');
    expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(error.code).toBe('CONFLICT');
  });

  it('UnauthorizedOperationException maps to 403', () => {
    const error = new UnauthorizedOperationException();
    expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
    expect(error.code).toBe('UNAUTHORIZED_OPERATION');
  });

  it('InsufficientStockException carries the shortage details', () => {
    const error = new InsufficientStockException('Tomato', 2, 5);
    expect(error.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(error.code).toBe('INSUFFICIENT_STOCK');
    expect(error.details).toEqual({
      inventoryItemName: 'Tomato',
      available: 2,
      requested: 5,
    });
  });

  it('CashSessionClosedException maps to 409', () => {
    const error = new CashSessionClosedException('session-1');
    expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(error.code).toBe('CASH_SESSION_CLOSED');
  });

  it('InvalidOrderStatusTransitionException carries from/to details', () => {
    const error = new InvalidOrderStatusTransitionException('READY', 'PENDING');
    expect(error.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(error.details).toEqual({ from: 'READY', to: 'PENDING' });
  });
});
