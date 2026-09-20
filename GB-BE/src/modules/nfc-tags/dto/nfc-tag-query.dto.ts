import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class NfcTagQueryDto {
  @ApiProperty()
  @IsUUID()
  branchId: string;
}
