import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { InfluencerStatus, MarketingChannel } from '../domain/marketing.types';

export class UpdateInfluencerDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 150 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ enum: MarketingChannel })
  @IsOptional()
  @IsEnum(MarketingChannel)
  channel?: MarketingChannel;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  followers?: number;

  @ApiPropertyOptional({ enum: InfluencerStatus })
  @IsOptional()
  @IsEnum(InfluencerStatus)
  status?: InfluencerStatus;
}
