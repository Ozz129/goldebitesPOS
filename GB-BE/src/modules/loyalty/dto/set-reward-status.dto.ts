import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetRewardStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
