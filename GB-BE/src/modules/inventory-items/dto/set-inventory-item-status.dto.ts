import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetInventoryItemStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
