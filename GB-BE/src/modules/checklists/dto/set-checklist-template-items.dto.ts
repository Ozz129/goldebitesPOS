import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { ChecklistTemplateItemInputDto } from './checklist-template-item-input.dto';

export class SetChecklistTemplateItemsDto {
  @ApiProperty({ type: [ChecklistTemplateItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChecklistTemplateItemInputDto)
  items: ChecklistTemplateItemInputDto[];
}
