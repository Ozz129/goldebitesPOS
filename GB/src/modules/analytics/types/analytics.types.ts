export interface DailySales {
  date: string;
  orderCount: number;
  totalAmount: number;
}

export interface TopProduct {
  productId: string | null;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface AnalyticsRangeFilters {
  dateFrom: string;
  dateTo: string;
  branchId?: string;
}

export interface TopProductsFilters extends AnalyticsRangeFilters {
  limit?: number;
}
