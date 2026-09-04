import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetSideStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
