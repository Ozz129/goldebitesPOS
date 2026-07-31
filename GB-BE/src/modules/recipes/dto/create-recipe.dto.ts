import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { RecipeItemInputDto } from './recipe-item-input.dto';

export class CreateRecipeDto {
  @ApiPropertyOptional({
    minLength: 2,
    maxLength: 150,
    description: 'Defaults to the product name if omitted',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ default: 1, minimum: 0.001 })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  yieldQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  instructions?: string;

  @ApiPropertyOptional({ type: [RecipeItemInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemInputDto)
  items?: RecipeItemInputDto[];
}
