import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { OrderStatus } from '../../orders/domain/order.interface';

/** The kitchen display can only move an order forward: preparation started, or ready to serve. */
const KITCHEN_STATUSES = [OrderStatus.PREPARING, OrderStatus.READY] as const;

export class UpdateKitchenStatusDto {
  @ApiProperty({ enum: KITCHEN_STATUSES })
  @IsIn(KITCHEN_STATUSES)
  status: OrderStatus;
}
