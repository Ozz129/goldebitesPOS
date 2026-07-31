export interface DashboardSummary {
  todaySales: {
    orderCount: number;
    totalAmount: number;
    averageTicket: number;
  };
  activeOrders: number;
  lowStockCount: number;
  cashSessionOpen: boolean | null;
}
