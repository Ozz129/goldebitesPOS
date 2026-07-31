import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class RecordCountDto {
  @ApiProperty()
  @IsUUID()
  inventoryItemId: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  countedQuantity: number;
}
