export interface TableName {
  id: string;
  businessId: string;
  branchId: string;
  tableNumber: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertTableNamePayload {
  branchId: string;
  tableNumber: string;
  name: string;
}
