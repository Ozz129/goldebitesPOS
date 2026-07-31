import { Injectable } from '@nestjs/common';
import {
  Order,
  OrderStatus,
  OrderWithItems,
} from '../../orders/domain/order.interface';
import { OrdersService } from '../../orders/services/orders.service';

@Injectable()
export class KitchenService {
  constructor(private readonly ordersService: OrdersService) {}

  async getQueue(businessId: string, branchId?: string): Promise<Order[]> {
    return this.ordersService.getKitchenQueue(businessId, branchId);
  }

  async updateStatus(
    businessId: string,
    orderId: string,
    status: OrderStatus,
    actorUserId?: string,
  ): Promise<OrderWithItems> {
    return this.ordersService.updateStatus(
      businessId,
      orderId,
      status,
      actorUserId,
    );
  }
}
