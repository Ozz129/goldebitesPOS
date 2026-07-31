import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetInventoryItemCategoryStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
