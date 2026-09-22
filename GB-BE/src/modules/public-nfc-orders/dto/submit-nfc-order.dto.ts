import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { OrderItemInputDto } from '../../orders/dto/order-item-input.dto';
import { OrderType } from '../../orders/domain/order.interface';

/** The only two order types a customer can submit from the NFC menu — DELIVERY/CAR_SERVICE aren't reachable from this flow. */
const PUBLIC_ORDER_TYPES = [OrderType.DINE_IN, OrderType.TAKEAWAY] as const;

export class SubmitNfcOrderDto {
  @ApiProperty({ enum: PUBLIC_ORDER_TYPES })
  @IsIn(PUBLIC_ORDER_TYPES)
  orderType: OrderType.DINE_IN | OrderType.TAKEAWAY;

  @ApiProperty({
    format: 'uuid',
    description:
      'Client-generated per submission attempt; resend the same value on any retry so a double-tap never duplicates the order.',
  })
  @IsUUID()
  idempotencyKey: string;

  @ApiProperty({ type: [OrderItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];
}
