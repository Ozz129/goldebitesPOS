import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetCouponStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
