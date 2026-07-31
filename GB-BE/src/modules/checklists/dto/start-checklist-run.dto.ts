import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class StartChecklistRunDto {
  @ApiProperty()
  @IsUUID()
  branchId: string;

  @ApiProperty()
  @IsUUID()
  templateId: string;
}
