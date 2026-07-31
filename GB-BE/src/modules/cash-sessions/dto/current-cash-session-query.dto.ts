import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CurrentCashSessionQueryDto {
  @ApiProperty()
  @IsUUID()
  branchId: string;
}
