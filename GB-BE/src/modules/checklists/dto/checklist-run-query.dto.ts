import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';
import { ChecklistRunStatus } from '../domain/checklist.types';

export class ChecklistRunQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: ChecklistRunStatus })
  @IsOptional()
  @IsEnum(ChecklistRunStatus)
  status?: ChecklistRunStatus;
}
