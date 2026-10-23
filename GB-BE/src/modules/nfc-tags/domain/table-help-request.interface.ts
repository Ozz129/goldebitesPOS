/** A table asking for staff from its NFC menu; pending until someone marks it attended. */
export interface TableHelpRequest {
  id: string;
  businessId: string;
  branchId: string;
  tableNumber: string;
  createdAt: Date;
  attendedAt: Date | null;
}

export interface TableHelpRequestRow {
  id: string;
  business_id: string;
  branch_id: string;
  table_number: string;
  created_at: Date;
  attended_at: Date | null;
}

/** A request as opened by a table's call: `is_new` when this call opened (or renewed) it. */
export interface OpenedTableHelpRequestRow extends TableHelpRequestRow {
  is_new: boolean;
}

/** What the customer's menu gets back — nothing that identifies the request beyond "it was received". */
export interface PublicHelpRequestView {
  requestedAt: Date;
}
