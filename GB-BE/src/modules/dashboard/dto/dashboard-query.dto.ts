import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description:
      'Scopes the summary to one branch; omit for the whole business',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
