import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetSauceStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
