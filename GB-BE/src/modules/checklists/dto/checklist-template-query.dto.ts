import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';
import { ChecklistType } from '../domain/checklist.types';

export class ChecklistTemplateQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ChecklistType })
  @IsOptional()
  @IsEnum(ChecklistType)
  type?: ChecklistType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
