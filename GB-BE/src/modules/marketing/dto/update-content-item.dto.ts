import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ContentItemStatus, MarketingChannel } from '../domain/marketing.types';

export class UpdateContentItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ minLength: 2, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ enum: MarketingChannel })
  @IsOptional()
  @IsEnum(MarketingChannel)
  channel?: MarketingChannel;

  @ApiPropertyOptional({ enum: ContentItemStatus })
  @IsOptional()
  @IsEnum(ContentItemStatus)
  status?: ContentItemStatus;
}
