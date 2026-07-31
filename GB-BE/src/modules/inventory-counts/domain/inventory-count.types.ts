import { CountStatus } from './inventory-count.interface';

export interface StartCountData {
  businessId: string;
  branchId: string;
  locationId?: string;
  inventoryItemIds: string[];
}

export interface CountQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: CountStatus;
  branchId?: string;
}
