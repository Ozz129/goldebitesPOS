import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';
import { LoyaltyMovementType } from '../domain/loyalty.types';

export class MovementQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ enum: LoyaltyMovementType })
  @IsOptional()
  @IsEnum(LoyaltyMovementType)
  type?: LoyaltyMovementType;
}
