import { Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../common/exceptions';
import { DailySales, TopProduct } from '../../orders/domain/order.interface';
import { OrdersService } from '../../orders/services/orders.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly ordersService: OrdersService) {}

  async getSalesByDay(
    businessId: string,
    branchId: string | undefined,
    dateFrom: string,
    dateTo: string,
  ): Promise<DailySales[]> {
    assertValidRange(dateFrom, dateTo);
    return this.ordersService.getSalesByDay(
      businessId,
      branchId,
      dateFrom,
      dateTo,
    );
  }

  async getTopProducts(
    businessId: string,
    branchId: string | undefined,
    dateFrom: string,
    dateTo: string,
    limit: number,
  ): Promise<TopProduct[]> {
    assertValidRange(dateFrom, dateTo);
    return this.ordersService.getTopProducts(
      businessId,
      branchId,
      dateFrom,
      dateTo,
      limit,
    );
  }
}

function assertValidRange(dateFrom: string, dateTo: string): void {
  if (new Date(dateFrom) > new Date(dateTo)) {
    throw new BusinessRuleException(
      'dateFrom must be before dateTo',
      'INVALID_DATE_RANGE',
    );
  }
}
