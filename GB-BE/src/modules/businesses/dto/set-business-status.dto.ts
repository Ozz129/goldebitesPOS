import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetBusinessStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
