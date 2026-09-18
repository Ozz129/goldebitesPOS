import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { InventoryQueryField, InventoryQueryOperator } from '../domain/inventory-query.types';

export class InventoryQueryConditionDto {
  @ApiProperty({ enum: InventoryQueryField })
  @IsEnum(InventoryQueryField)
  field: InventoryQueryField;

  @ApiProperty({ enum: InventoryQueryOperator })
  @IsEnum(InventoryQueryOperator)
  operator: InventoryQueryOperator;

  @ApiPropertyOptional({ description: 'Required for every operator except isEmpty/isNotEmpty/in' })
  @IsOptional()
  value?: string | number | boolean;

  @ApiPropertyOptional({ description: 'Second bound, only for the "between" operator' })
  @IsOptional()
  value2?: string | number;

  @ApiPropertyOptional({ description: 'Only for the "in" operator (category multi-select)' })
  @IsOptional()
  @IsArray()
  values?: string[];
}
