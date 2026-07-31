import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';
import { ContentItemStatus, MarketingChannel } from '../domain/marketing.types';

export class ContentItemQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ContentItemStatus })
  @IsOptional()
  @IsEnum(ContentItemStatus)
  status?: ContentItemStatus;

  @ApiPropertyOptional({ enum: MarketingChannel })
  @IsOptional()
  @IsEnum(MarketingChannel)
  channel?: MarketingChannel;
}
