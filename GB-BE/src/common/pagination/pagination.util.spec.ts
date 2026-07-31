import {
  buildPaginationMeta,
  getOffset,
  resolveSortColumn,
  resolveSortOrder,
} from './pagination.util';
import { SortOrder } from './pagination-query.dto';

describe('pagination.util', () => {
  describe('buildPaginationMeta', () => {
    it('computes totalPages and navigation flags', () => {
      expect(buildPaginationMeta(2, 20, 45)).toEqual({
        page: 2,
        limit: 20,
        total: 45,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('handles zero total records', () => {
      expect(buildPaginationMeta(1, 20, 0)).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });

  describe('getOffset', () => {
    it('computes SQL OFFSET from page and limit', () => {
      expect(getOffset(1, 20)).toBe(0);
      expect(getOffset(3, 20)).toBe(40);
    });
  });

  describe('resolveSortColumn', () => {
    const allowed = { name: 'name', createdAt: 'created_at' };

    it('returns the default column when nothing is requested', () => {
      expect(resolveSortColumn(undefined, allowed, 'created_at')).toBe(
        'created_at',
      );
    });

    it('returns the mapped column when whitelisted', () => {
      expect(resolveSortColumn('name', allowed, 'created_at')).toBe('name');
    });

    it('falls back to the default column for unknown input, preventing SQL injection via ORDER BY', () => {
      expect(
        resolveSortColumn('"; DROP TABLE products; --', allowed, 'created_at'),
      ).toBe('created_at');
    });
  });

  describe('resolveSortOrder', () => {
    it('defaults to DESC', () => {
      expect(resolveSortOrder(undefined)).toBe('DESC');
    });

    it('returns ASC when explicitly requested', () => {
      expect(resolveSortOrder(SortOrder.ASC)).toBe('ASC');
    });
  });
});
