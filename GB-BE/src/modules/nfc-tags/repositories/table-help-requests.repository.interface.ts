import {
  OpenedTableHelpRequestRow,
  TableHelpRequestRow,
} from '../domain/table-help-request.interface';

export interface ITableHelpRequestsRepository {
  /**
   * Opens a pending request for the table, or returns the one already
   * pending — a second press never stacks alerts. A pending request nobody
   * attended for longer than the listing window is renewed instead, so the
   * table is not left unable to call. `is_new` tells a new call (opened or
   * renewed now) from a repeated press.
   */
  openForTable(
    businessId: string,
    branchId: string,
    tableNumber: string,
  ): Promise<OpenedTableHelpRequestRow>;
  /** Pending requests still worth alerting about, oldest first. */
  findPending(
    businessId: string,
    branchId?: string,
  ): Promise<TableHelpRequestRow[]>;
  /** Null when it does not exist for the business or was already attended. */
  markAttended(
    id: string,
    businessId: string,
    userId: string,
  ): Promise<TableHelpRequestRow | null>;
}

export const TABLE_HELP_REQUESTS_REPOSITORY = Symbol(
  'TABLE_HELP_REQUESTS_REPOSITORY',
);
