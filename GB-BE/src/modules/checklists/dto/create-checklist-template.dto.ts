import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ChecklistType } from '../domain/checklist.types';
import { ChecklistTemplateItemInputDto } from './checklist-template-item-input.dto';

export class CreateChecklistTemplateDto {
  @ApiProperty({ enum: ChecklistType })
  @IsEnum(ChecklistType)
  type: ChecklistType;

  @ApiProperty({ minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({ type: [ChecklistTemplateItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChecklistTemplateItemInputDto)
  items: ChecklistTemplateItemInputDto[];
}
