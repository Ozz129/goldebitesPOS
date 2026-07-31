import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ChecklistType } from '../domain/checklist.types';

export class UpdateChecklistTemplateDto {
  @ApiPropertyOptional({ enum: ChecklistType })
  @IsOptional()
  @IsEnum(ChecklistType)
  type?: ChecklistType;

  @ApiPropertyOptional({ minLength: 2, maxLength: 150 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;
}
