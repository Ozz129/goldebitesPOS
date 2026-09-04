import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  sku?: string;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  imageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
    description:
      'How many sauces can be chosen when ordering this product (0 = none offered)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxSauces?: number;

  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
    description:
      'How many sides can be chosen when ordering this product (0 = none offered)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxSides?: number;
}
