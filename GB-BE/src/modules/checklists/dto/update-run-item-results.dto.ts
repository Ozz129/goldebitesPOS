import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ItemResultInputDto } from './item-result-input.dto';

export class UpdateRunItemResultsDto {
  @ApiProperty({ type: [ItemResultInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemResultInputDto)
  items: ItemResultInputDto[];
}
