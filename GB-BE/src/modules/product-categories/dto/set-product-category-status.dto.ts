import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetProductCategoryStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
