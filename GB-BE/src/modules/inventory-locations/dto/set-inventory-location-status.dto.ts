import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetInventoryLocationStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
