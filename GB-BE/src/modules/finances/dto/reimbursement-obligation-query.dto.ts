import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';
import { ReimbursementObligationStatus } from '../domain/reimbursement.types';

export class ReimbursementObligationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReimbursementObligationStatus })
  @IsOptional()
  @IsEnum(ReimbursementObligationStatus)
  status?: ReimbursementObligationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  payerEmployeeId?: string;
}
