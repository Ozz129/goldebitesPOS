import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetBranchStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
