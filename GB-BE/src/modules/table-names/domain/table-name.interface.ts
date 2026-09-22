export interface TableName {
  id: string;
  businessId: string;
  branchId: string;
  tableNumber: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TableNameRow {
  id: string;
  business_id: string;
  branch_id: string;
  table_number: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
