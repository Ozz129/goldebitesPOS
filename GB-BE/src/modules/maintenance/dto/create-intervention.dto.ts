import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateInterventionDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  cost: number;
}
