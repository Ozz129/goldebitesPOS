import { HttpStatus } from '@nestjs/common';
import { DatabaseError } from 'pg';
import { isPgDatabaseError, mapPgError } from './pg-error-mapper';

function makePgError(
  code: string,
  extra: Partial<DatabaseError> = {},
): DatabaseError {
  const error = new Error('pg error') as unknown as DatabaseError;
  (error as unknown as { code: string }).code = code;
  Object.assign(error, extra);
  return error;
}

describe('pg-error-mapper', () => {
  describe('isPgDatabaseError', () => {
    it('returns true for errors carrying a pg error code', () => {
      expect(isPgDatabaseError(makePgError('23505'))).toBe(true);
    });

    it('returns false for regular errors without a code', () => {
      expect(isPgDatabaseError(new Error('boom'))).toBe(false);
    });

    it('returns false for non-error values', () => {
      expect(isPgDatabaseError('not an error')).toBe(false);
    });
  });

  describe('mapPgError', () => {
    it('maps unique_violation (23505) to 409 DUPLICATE_ENTRY', () => {
      const mapped = mapPgError(
        makePgError('23505', { constraint: 'products_sku_key' }),
      );
      expect(mapped.status).toBe(HttpStatus.CONFLICT);
      expect(mapped.code).toBe('DUPLICATE_ENTRY');
      expect(mapped.details.constraint).toBe('products_sku_key');
    });

    it('maps foreign_key_violation (23503) to 409 REFERENCED_ENTITY_INVALID', () => {
      const mapped = mapPgError(makePgError('23503'));
      expect(mapped.status).toBe(HttpStatus.CONFLICT);
      expect(mapped.code).toBe('REFERENCED_ENTITY_INVALID');
    });

    it('maps not_null_violation (23502) to 400 MISSING_REQUIRED_FIELD', () => {
      const mapped = mapPgError(makePgError('23502', { column: 'name' }));
      expect(mapped.status).toBe(HttpStatus.BAD_REQUEST);
      expect(mapped.code).toBe('MISSING_REQUIRED_FIELD');
      expect(mapped.message).toContain('name');
    });

    it('maps check_violation (23514) to 400 CHECK_CONSTRAINT_VIOLATION', () => {
      const mapped = mapPgError(makePgError('23514'));
      expect(mapped.status).toBe(HttpStatus.BAD_REQUEST);
      expect(mapped.code).toBe('CHECK_CONSTRAINT_VIOLATION');
    });

    it('maps unknown codes to a generic 500 DATABASE_ERROR without leaking internals', () => {
      const mapped = mapPgError(makePgError('55000'));
      expect(mapped.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mapped.code).toBe('DATABASE_ERROR');
      expect(mapped.details).toEqual({});
    });
  });
});
