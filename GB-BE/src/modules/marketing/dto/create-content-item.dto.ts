import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MarketingChannel } from '../domain/marketing.types';

export class CreateContentItemDto {
  @ApiProperty()
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ minLength: 2, maxLength: 200 })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiProperty({ enum: MarketingChannel })
  @IsEnum(MarketingChannel)
  channel: MarketingChannel;
}
