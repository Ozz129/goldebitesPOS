import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';
import { InfluencerStatus } from '../domain/marketing.types';

export class InfluencerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: InfluencerStatus })
  @IsOptional()
  @IsEnum(InfluencerStatus)
  status?: InfluencerStatus;
}
