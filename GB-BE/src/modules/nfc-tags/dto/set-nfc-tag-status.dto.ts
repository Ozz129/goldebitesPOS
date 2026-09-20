import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetNfcTagStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
