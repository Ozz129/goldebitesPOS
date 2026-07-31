import { HttpStatus } from '@nestjs/common';
import { DatabaseError } from 'pg';

export interface MappedPgError {
  status: HttpStatus;
  code: string;
  message: string;
  details: Record<string, unknown>;
}

const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
} as const;

export function isPgDatabaseError(error: unknown): error is DatabaseError {
  return (
    error instanceof Error && typeof (error as DatabaseError).code === 'string'
  );
}

/**
 * Translates a raw PostgreSQL error into an HTTP-friendly shape without
 * leaking internal details (constraint names, column names, driver text)
 * to the client.
 */
export function mapPgError(error: DatabaseError): MappedPgError {
  switch (error.code) {
    case PG_ERROR_CODES.UNIQUE_VIOLATION:
      return {
        status: HttpStatus.CONFLICT,
        code: 'DUPLICATE_ENTRY',
        message: 'A record with the same unique value already exists',
        details: { constraint: error.constraint },
      };
    case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
      return {
        status: HttpStatus.CONFLICT,
        code: 'REFERENCED_ENTITY_INVALID',
        message:
          'This operation references a record that does not exist or is in use',
        details: { constraint: error.constraint },
      };
    case PG_ERROR_CODES.NOT_NULL_VIOLATION:
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'MISSING_REQUIRED_FIELD',
        message: `Field "${error.column}" is required`,
        details: { column: error.column },
      };
    case PG_ERROR_CODES.CHECK_VIOLATION:
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'CHECK_CONSTRAINT_VIOLATION',
        message: 'One or more values violate a data constraint',
        details: { constraint: error.constraint },
      };
    default:
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'DATABASE_ERROR',
        message: 'An unexpected database error occurred',
        details: {},
      };
  }
}
