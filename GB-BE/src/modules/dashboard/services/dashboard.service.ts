import { Injectable } from '@nestjs/common';
import { CashSessionsService } from '../../cash-sessions/services/cash-sessions.service';
import { InventoryMovementsService } from '../../inventory-movements/services/inventory-movements.service';
import { OrdersService } from '../../orders/services/orders.service';

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

@Injectable()
export class DashboardService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly movementsService: InventoryMovementsService,
    private readonly cashSessionsService: CashSessionsService,
  ) {}

  async getSummary(
    businessId: string,
    branchId?: string,
  ): Promise<DashboardSummary> {
    const { dateFrom, dateTo } = todayRange();

    const [salesSummary, activeOrders, lowStockAlerts, cashSessionOpen] =
      await Promise.all([
        this.ordersService.getSalesSummary(
          businessId,
          branchId,
          dateFrom,
          dateTo,
        ),
        this.ordersService.getActiveCount(businessId, branchId),
        this.movementsService.getLowStockAlerts(businessId, branchId),
        branchId
          ? this.cashSessionsService.hasOpenSession(businessId, branchId)
          : null,
      ]);

    const averageTicket =
      salesSummary.orderCount > 0
        ? round2(salesSummary.totalAmount / salesSummary.orderCount)
        : 0;

    return {
      todaySales: { ...salesSummary, averageTicket },
      activeOrders,
      lowStockCount: lowStockAlerts.length,
      cashSessionOpen,
    };
  }
}

function todayRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { dateFrom: startOfDay.toISOString(), dateTo: now.toISOString() };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
