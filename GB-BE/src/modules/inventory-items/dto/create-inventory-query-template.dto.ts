import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { InventoryQueryIntent } from '../domain/inventory-query.types';
import { InventoryQueryConditionDto } from './inventory-query-condition.dto';

export class CreateInventoryQueryTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ type: [InventoryQueryConditionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryQueryConditionDto)
  conditions: InventoryQueryConditionDto[];

  @ApiPropertyOptional({ enum: InventoryQueryIntent, default: InventoryQueryIntent.DETAIL })
  @IsOptional()
  @IsEnum(InventoryQueryIntent)
  intent: InventoryQueryIntent = InventoryQueryIntent.DETAIL;
}
