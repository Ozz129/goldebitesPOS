import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetChecklistTemplateStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
