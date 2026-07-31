import { PaginationMeta } from './paginated-result.interface';
import { SortOrder } from './pagination-query.dto';

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Resolves a user-supplied `sortBy` against a whitelist of real column
 * names. Never pass client input straight into an ORDER BY clause.
 */
export function resolveSortColumn(
  requested: string | undefined,
  allowedColumns: Record<string, string>,
  defaultColumn: string,
): string {
  if (!requested) {
    return defaultColumn;
  }
  return allowedColumns[requested] ?? defaultColumn;
}

export function resolveSortOrder(order: SortOrder | undefined): 'ASC' | 'DESC' {
  return order === SortOrder.ASC ? 'ASC' : 'DESC';
}
