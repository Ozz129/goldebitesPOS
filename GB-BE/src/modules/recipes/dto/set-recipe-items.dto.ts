import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RecipeItemInputDto } from './recipe-item-input.dto';

export class SetRecipeItemsDto {
  @ApiProperty({ type: [RecipeItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemInputDto)
  items: RecipeItemInputDto[];
}
