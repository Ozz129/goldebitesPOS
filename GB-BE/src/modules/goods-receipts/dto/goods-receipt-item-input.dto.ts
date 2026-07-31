import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class GoodsReceiptItemInputDto {
  @ApiProperty()
  @IsUUID()
  purchaseOrderItemId: string;

  @ApiProperty({ minimum: 0.001 })
  @IsNumber()
  @Min(0.001)
  quantityReceived: number;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  unitCost: number;
}
