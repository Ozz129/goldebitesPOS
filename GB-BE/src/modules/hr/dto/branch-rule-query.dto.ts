import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BranchRuleQueryDto {
  @ApiProperty()
  @IsUUID()
  branchId: string;
}
