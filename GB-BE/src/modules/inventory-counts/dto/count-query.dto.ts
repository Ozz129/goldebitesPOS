import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';
import { CountStatus } from '../domain/inventory-count.interface';

export class CountQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CountStatus })
  @IsOptional()
  @IsEnum(CountStatus)
  status?: CountStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
